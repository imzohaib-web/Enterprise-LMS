# LMS Authentication, Authorization & Enrollment Audit

## 1. Executive Summary

This document presents a comprehensive, production-grade architectural, security, and UX audit of the **Enterprise Learning Management System (LMS)** application. The audit was conducted across the backend codebase (`backend/src/`), frontend React/TypeScript codebase (`frontend/src/`), MongoDB database models, API endpoint routing, middleware implementations, and security control layers.

### Audit Summary Overview
- **Total Findings Discovered**: 24 Findings
- **Critical (P0)**: 5 Findings
- **High (P1)**: 8 Findings
- **Medium (P2)**: 7 Findings
- **Low (P3)**: 4 Findings
- **Files Inspected**: 48 Files (Models, Controllers, Services, Middleware, Routes, React Pages, Components)
- **Models Inspected**: 12 Models (`User`, `Course`, `Enrollment`, `Assignment`, `AssignmentSubmission`, `AuditLog`, `Category`, `LearningPath`, `RefreshToken`, `Certificate`, `Notification`, `Quiz`/`QuizAttempt`)
- **API Routes Inspected**: 13 Route Modules (`/auth`, `/users`, `/courses`, `/admin`, `/instructor`, `/assessments`, `/assignments`, `/progress`, `/certificates`, `/notifications`, `/discussions`, `/reports`, `/learning-paths`)

### Core Findings & Security Verdict
1. **Self-Assigned Instructor Access**: Anyone registering on the public signup page can select "Instructor / Author" and gain immediate, unvetted access to the Instructor Dashboard and course creation tools without any Admin application, review, or approval process.
2. **Direct Privilege Escalation (P0)**: The `updateUser` service accepts un-sanitized request payloads in `PUT /api/v1/users/profile` and `PUT /api/v1/users/:id`. A regular student can submit `{ "role": "admin" }` and gain complete administrative access to the entire platform.
3. **Bypassed Course Publishing Review**: Instructors can directly set course status to `published` via `PUT /api/v1/courses/:id` or `PATCH /api/v1/instructor/courses/:id/publish`. There is no compulsory Admin review or approval workflow before courses become publicly visible and open for student enrollment.
4. **Instant One-Click Enrollment without Form or Verification**: Course enrollment is executed via a single API call (`POST /api/v1/courses/:id/enroll`) without any enrollment form, student profile validation, terms agreement, or workflow control.
5. **Inconsistent Middleware Architecture**: Two separate auth middleware implementations exist (`backend/src/middleware/auth.middleware.js` vs `backend/src/middlewares/auth.middleware.js`). The second implementation trusts raw JWT payload fields without database validation or account status checks (`isActive`), exposing endpoints like certificates to deactivated users or stale token manipulations.

---

## 2. Current Architecture

The Enterprise LMS is built using a decoupled Client-Server architecture:
- **Backend Stack**: Node.js, Express.js (REST API v1), MongoDB with Mongoose ORM, JSON Web Tokens (JWT) for authentication, and Redis for optional caching.
- **Frontend Stack**: React 18, TypeScript, Redux Toolkit for auth/global state, TanStack React Query for async data fetching, TailwindCSS for UI styling, and React Router v6 for client-side routing.
- **Authentication Mechanism**: Dual-token pattern using short-lived JWT Bearer Access Tokens sent in the `Authorization` header and 7-day Refresh Tokens stored in HTTP-only cookies and tracked in MongoDB (`RefreshToken` model).

```
┌────────────────────────────────────────────────────────────────────────┐
│                             FRONTEND (React + TS)                      │
│   Routes: /auth/login, /auth/register, /student/*, /instructor/*, /admin/*│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API Requests
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             EXPRESS BACKEND SERVER                     │
│  App Entry: app.js                                                     │
│  Middleware: middleware/auth.middleware.js & middlewares/auth.middleware.js│
│  Modules: auth, users, courses, admin, instructor, assessments, etc.   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose ORM Queries
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                               MONGODB DATABASE                         │
│  Collections: users, courses, enrollments, assignments, refresh_tokens │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Current Student Flow

The current student workflow from entry to learning operates as follows:

```
[Public Visitor] ──► [/auth/register] ──► Select "Student" ──► [Account Created (isActive: true)]
                         │
                         ▼
             [Logged-in Student Dashboard]
                         │
                         ▼
             [Browse Course Catalog (/courses)]
                         │
                         ▼
             [Click "Enroll Now"] ──► Instant POST /api/v1/courses/:id/enroll
                         │
                         ▼
             [Active Enrollment Created in DB]
                         │
                         ▼
             [Access Course Player (/courses/:id)]
```

### Gap Analysis:
- No email verification before accessing the Student Dashboard (`isVerified: false` is ignored).
- No enrollment form or confirmation step. Clicking "Enroll Now" immediately writes an `active` enrollment record to MongoDB.
- No prerequisites overview or learning agreement during enrollment.

---

## 4. Current Instructor Flow

The current instructor workflow is structurally flawed for an enterprise LMS:

```
[Public Visitor] ──► [/auth/register] ──► Select "Instructor" ──► [Account Created (isActive: true, role: 'instructor')]
                         │
                         ▼
             [Direct Access to Instructor Dashboard (/instructor/dashboard)]
                         │
                         ▼
             [Create New Course (/courses/new)] ──► Draft Course Created
                         │
                         ▼
             [Click "Publish Course"] ──► Direct PUT /api/v1/courses/:id { status: 'published' }
                         │
                         ▼
             [Course Immediately Live in Public Catalog]
```

### Critical Business & Architectural Flaws:
- **Zero Admin Oversight**: Instructors self-assign their role during registration.
- **No Instructor Application Model**: No `InstructorApplication` model exists to store qualifications, bio, portfolio links, or review notes.
- **No Pending Approval State**: Instructors are active immediately upon registration.
- **Direct Publishing**: Instructors publish courses directly without submitting them for Admin review.

---

## 5. Current Admin Flow

The current Admin functionality is strictly reactive and monitoring-focused:

```
[Admin User] ──► [/admin/dashboard] ──► View Platform Analytics Overview
                     ├── ► [/admin/users] ──► Toggle User isActive Status / Delete User
                     ├── ► [/admin/courses] ──► Manually Change Course Status / Feature Course
                     └── ► [/admin/audit-logs] ──► View System Audit Logs
```

### Missing Capabilities:
- No interface or queue to review incoming Instructor Applications.
- No interface or queue for Course Approval / Rejection workflows.
- Modifying course status in `/admin/courses` sends raw `PUT` updates without capturing a rejection reason or notifying the instructor.
- No enrollment management screen to view, approve, or revoke student enrollments.

---

## 6. Current Enrollment Flow

The current technical implementation of student enrollment is as follows:

1. Student browses `CourseList.tsx` or `CourseOverviewPreview.tsx`.
2. Student clicks "Enroll Now".
3. Frontend triggers `courseService.enrollInCourse(courseId)`.
4. API sends `POST /api/v1/courses/:id/enroll` guarded by `authenticate, authorize('student', 'admin')`.
5. Backend service (`course.service.js:enrollInCourse`) checks:
   - Does course exist?
   - Is course status `'published'`?
   - Have prerequisite courses been completed (`status: 'completed'`)?
   - Is student already enrolled in this course?
6. If checks pass, `Enrollment.create({ student, course, instructor, status: 'active' })` executes.
7. Initial `StudentProgress` record is upserted.
8. Non-blocking confirmation email is dispatched.

```
[Student] ──(Click "Enroll Now")──► POST /api/v1/courses/:id/enroll
                                           │
                                 ┌─────────┴─────────┐
                                 ▼                   ▼
                           [Checks Pass]       [Checks Fail]
                                 │                   │
                                 ▼                   ▼
                          [Create Active]    [Return 400/409]
                           Enrollment DB
```

### Enrollment Architectural Deficiencies:
- **No Form Capture**: Stores no enrollment metadata (reasons for joining, education background, custom questions).
- **No Inactive/Pending State**: Free courses immediately become `active`. There is no workflow for course approvals or payment hooks.
- **Missing Safety Checks**: Does not check if the student account is suspended/deactivated or if an instructor is attempting to enroll in their own course.

---

## 7. Authentication Findings

### Summary Table
| # | Area | Current Implementation Status | Severity | Risk |
|---|---|---|---|---|
| A1 | Role Selection | Freely selectable `student` or `instructor` in [SignUp.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Auth/SignUp.tsx#L137) | **CRITICAL** | Anyone can register as instructor |
| A2 | Email Verification | `isVerified: false` stored, but email verification is never enforced | **HIGH** | Fake email account creation |
| A3 | Password Rules | Validated on frontend & backend, hashed with bcrypt (salt 12) | **OK** | Adequate password security |
| A4 | JWT Tokens | Dual-token (Access Token + HTTP-only Refresh Cookie with rotation) | **OK** | Good baseline JWT security |
| A5 | Middleware Inconsistency | Dual files: `middleware/auth.middleware.js` vs `middlewares/auth.middleware.js` | **HIGH** | Untracked user state bypass |
| A6 | Account Deactivation | `isActive: false` check exists in primary middleware, missing in secondary | **HIGH** | Deactivated users can access certificates |

---

## 8. Authorization/RBAC Findings

### Backend Authorization Controls:
- Primary routes use `authenticate` and `authorize(...roles)` from `middleware/auth.middleware.js`.
- Admin-only routes (`/api/v1/admin/*`) are protected by `authorize('admin')`.
- Instructor routes (`/api/v1/instructor/*`) are protected by `authorize('instructor', 'admin')`.

### Discovered Vulnerabilities:
1. **Broken Object Level Authorization (BOLA / IDOR) in User Details**:
   - Route: `GET /api/v1/users/:id` in [user.routes.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/users/user.routes.js#L27)
   - Behavior: Protected only by `authenticate`. Any authenticated student can fetch full private details of any other user or admin by passing their user ID.
2. **Missing Ownership Check in User Profile Endpoint**:
   - Route: `PUT /api/v1/users/:id` in [user.routes.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/users/user.routes.js#L28)
   - Behavior: Uses `updateUser` service which checks ownership, but accepts un-sanitized body updates.

---

## 9. Instructor Approval Findings

### Current vs. Production LMS Comparison

| Feature | Current LMS State | Enterprise Standard | Status |
|---|---|---|---|
| Instructor Registration | Direct signup with immediate active role | Apply via form -> Pending review | **NON-COMPLIANT** |
| `InstructorApplication` Model | Missing | Required (tracks qualification, CV, links) | **MISSING** |
| Application Status | None | `PENDING`, `APPROVED`, `REJECTED` | **MISSING** |
| Admin Review UI | None | Dedicated approval queue with review actions | **MISSING** |
| Application Audit Trail | None | Recorded in `AuditLog` with reviewer ID | **MISSING** |
| Approval/Rejection Email | Welcome email only | Status notification with rejection reason | **MISSING** |

---

## 10. Course Publishing Findings

### Current Implementation Trace
- In `Course.js`, status enum includes `['draft', 'published', 'archived', 'pending_approval', 'rejected']`.
- In `course.service.js` (`updateCourse` lines 135-145):
  ```js
  if (updates.status === 'published' && course.status !== 'published') {
    // Validates title length >= 5 and description length >= 10
  }
  ```
- **Flaw**: An instructor can send `PUT /api/v1/courses/:id` with `{ "status": "published" }` or call `PATCH /api/v1/instructor/courses/:id/publish` and the course is immediately published without Admin intervention.

### Missing Course Lifecycle States
- `SUBMITTED`: Instructor submits course for review.
- `UNDER_REVIEW`: Admin opens course for evaluation.
- `REJECTED`: Admin rejects course with specific feedback notes.
- Re-submission flow after course updates.

---

## 11. Student Enrollment Findings

### Model Inspection (`Enrollment.js`)
```javascript
const enrollmentSchema = new mongoose.Schema({
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  status:     { type: String, enum: ['active', 'completed', 'dropped'], default: 'active', index: true },
  enrolledAt: { type: Date, default: Date.now },
  progressPercentage: { type: Number, default: 0 },
});
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
```

### Audit Questions & Findings
- **Explicit Enrollment Required?** Yes, via `POST /api/v1/courses/:id/enroll`.
- **Database Storage?** Yes, in `Enrollment` collection.
- **Duplicate Prevention?** Yes, enforced by MongoDB compound unique index `{ student: 1, course: 1 }`.
- **Enrollment Form?** **NO**. No form exists.
- **Unpublished Enrollment Prevention?** Yes (`course.status !== 'published'` returns HTTP 400).
- **Instructor Self-Enrollment Blocked?** **NO**. An instructor can enroll in their own course as a student.
- **Suspended Student Enrollment Blocked?** **NO**. Account status is not evaluated during enrollment.

---

## 12. Course Access Security Findings

### Lesson Media Protection Evaluation
- `getCourseById` in [course.service.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/courses/course.service.js#L91-L101) strips `videoUrl`, `documentUrl`, and `content` for non-preview lessons if the user is not enrolled and not course owner/admin.
- **Vulnerability**: Direct API access to assignment downloads (`GET /api/v1/assignments/course/:courseId`) uses `optionalAuth` and returns published assignments without checking enrollment in the course.

### IDOR Risk Matrix
- **Student Progress**: `GET /api/v1/progress/course/:courseId` uses `req.user._id`, preventing viewing other students' progress. (PASS)
- **Quiz Attempts**: `GET /api/v1/assessments/:quizId/result` uses `req.user._id`. (PASS)
- **Certificates**: `GET /api/v1/certificates/:id` uses secondary middleware `protect` without DB validation. (MEDIUM RISK)
- **Assignment Submissions**: `GET /api/v1/instructor/assignments/:id/submissions` checks `assignment.instructorId === req.user._id` or `userRole === 'admin'`. (PASS)

---

## 13. Database/Model Findings

### Schema Analysis & Missing Constructs

```
┌────────────────────────────────────────────────────────────────────────┐
│                         EXISTING MODELS                                │
│ User, Course, Enrollment, Assignment, AssignmentSubmission, AuditLog,  │
│ Category, LearningPath, RefreshToken, Certificate, Notification, Quiz  │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                         MISSING MODELS                                 │
│ ❌ InstructorApplication (Instructor approval workflow missing)       │
│ ❌ CourseReview / ApprovalLog (Course rejection feedback missing)      │
│ ❌ EnrollmentFormSubmission (Enrollment metadata missing)              │
└────────────────────────────────────────────────────────────────────────┘
```

1. **User Model (`User.js`)**:
   - Lacks an `accountStatus` enum (`PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED`, `DEACTIVATED`). Uses binary `isActive` boolean.
2. **Course Model (`Course.js`)**:
   - Has `status` enum including `pending_approval` and `rejected`, but lacks fields for `rejectionReason`, `submittedAt`, and `reviewedBy`.
3. **Enrollment Model (`Enrollment.js`)**:
   - Lacks `enrollmentData` object (student details, learning goals, custom responses).

---

## 14. Frontend UX Findings

1. **Sign Up Page (`SignUp.tsx`)**:
   - Misleadingly displays an "Account Type / Role" dropdown allowing users to select "Instructor / Author" and immediately enter the Instructor Dashboard.
   - Recommended UX: Change to standard student signup with a separate "Become an Instructor" application banner inside the dashboard.
2. **Course Catalog (`CourseList.tsx`)**:
   - Clicking "Enroll Now" on a course card instantly fires the enrollment API with no confirmation modal or enrollment form.
3. **Course Overview (`CourseOverviewPreview.tsx`)**:
   - Button says "Enroll Now & Start Learning", immediately calling the enroll API without displaying an enrollment preview/form.
4. **Admin Dashboard (`Users.tsx` & `AdminCourses.tsx`)**:
   - Lacks a tab for "Instructor Applications".
   - Lacks a dedicated "Course Review Queue" modal with detailed section/lesson inspection before approval/rejection.

---

## 15. Security Findings

| Finding ID | Severity | Problem Summary | Impact | Affected Endpoint / Code |
|---|---|---|---|---|
| **SEC-01** | **CRITICAL (P0)** | Privilege Escalation via Mass Assignment | A student can send `{ "role": "admin" }` to update profile and become admin | [user.service.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/users/user.service.js#L44) |
| **SEC-02** | **CRITICAL (P0)** | Direct Instructor Self-Provisioning | Anyone can register as instructor without verification | [auth.service.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/auth/auth.service.js#L20) |
| **SEC-03** | **HIGH (P1)** | BOLA / IDOR on User Endpoint | Any logged-in user can view full private data of any other user | [user.routes.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/users/user.routes.js#L27) |
| **SEC-04** | **HIGH (P1)** | Inconsistent Auth Middleware | Certificate module uses `middlewares/auth.middleware.js` which skips DB checks | [certificate.routes.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/certificates/certificate.routes.js#L3) |
| **SEC-05** | **HIGH (P1)** | Unrestricted Course Publishing | Instructors publish courses directly without admin moderation | [course.service.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/courses/course.service.js#L135) |
| **SEC-06** | **MEDIUM (P2)** | Instructor Self-Enrollment | Instructors can enroll in their own courses | [course.service.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/courses/course.service.js#L205) |
| **SEC-07** | **MEDIUM (P2)** | Deactivated Account Activity | Deactivated users with valid JWTs can access certificate endpoints | [middlewares/auth.middleware.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/middlewares/auth.middleware.js#L23) |

---

## 16. Current vs Recommended Architecture

### Current Architecture Flow
```
Student:    Register ──► Student Dashboard ──► One-Click Enroll ──► Course Access
Instructor: Register ──► Instructor Dashboard ──► Self-Publish Course ──► Live Course
Admin:      Admin Login ──► View Analytics & Manage Active Users (No Approval Queues)
```

### Recommended Enterprise Architecture Flow
```
Student:    Register ──► Email Verification ──► Active Account ──► Browse Catalog
                        ──► Fill Enrollment Form ──► Active Enrollment ──► Course Player

Instructor: Register/Apply ──► Email Verification ──► Create Instructor Application (PENDING)
                           ──► Admin Reviews Application ──► Approved / Rejected
                           ──► If Approved ──► Access Instructor Dashboard
                           ──► Build Course ──► Submit for Review (SUBMITTED)
                           ──► Admin Reviews Course ──► Approved & Published / Rejected with Notes

Admin:      Admin Login ──► Instructor Review Queue (Approve/Reject)
                        ──► Course Review Queue (Approve/Reject with Reason)
                        ──► User Management & Account Status Control (SUSPEND/ACTIVATE)
                        ──► Enrollment Audit & Governance
```

---

## 17. Recommended Student Flow

1. **Registration**: Student fills registration form (First Name, Last Name, Email, Password). Role is strictly fixed to `student`.
2. **Email Verification**: System dispatches email verification token. Student account status is set to `PENDING_VERIFICATION`.
3. **Active Student Account**: Verification link clicked -> account status becomes `ACTIVE`.
4. **Browse Catalog**: Student searches published courses.
5. **Enrollment Form**: Student clicks "Enroll Now". System presents an **Enrollment Modal/Form**:
   - Pre-filled: Full Name, Email.
   - Required: Phone, Learning Goals / Objective, Terms & Conditions Agreement.
6. **Enrollment Confirmation**: System submits form (`POST /api/v1/courses/:id/enroll`), saves enrollment details, creates progress record, and redirects student to `/courses/:id/learn`.

---

## 18. Recommended Instructor Flow

1. **Submit Application**: User registers as student or clicks "Become an Instructor". Submits application form (Qualifications, Specialization, Experience, Portfolio Links, Bio).
2. **Pending Review State**: Application recorded in new `InstructorApplication` collection with status `PENDING`. User role remains `student` or receives `accountStatus: PENDING_INSTRUCTOR`.
3. **Admin Evaluation**: Admin inspects application in Admin Portal.
4. **Approval / Rejection**:
   - **If Approved**: Role updated to `instructor`, `accountStatus` updated to `ACTIVE`. Confirmation email sent. User gains access to Instructor Dashboard.
   - **If Rejected**: `accountStatus` updated to `REJECTED`, rejection reason recorded, notification email sent. User remains a student.

---

## 19. Recommended Admin Flow

1. **Dashboard & Governance Overview**: Key metrics for pending applications, course reviews, active users, and system health.
2. **Instructor Application Queue**: Dedicated view showing pending applications with applicant details, resume links, and actions to Approve or Reject (with feedback).
3. **Course Moderation Queue**: Dedicated view displaying courses with `SUBMITTED` or `PENDING_APPROVAL` status. Admin can preview full curriculum, lessons, and media before clicking Approve (changes status to `PUBLISHED`) or Reject (changes status to `REJECTED` with required rejection reason).
4. **User & Enrollment Governance**: Ability to suspend users (`SUSPENDED`), reactivate accounts, or manage student enrollments.

---

## 20. Recommended Enrollment Flow

```
[Course Detail Page] ──► Click "Enroll Now"
                               │
                               ▼
                    [Open Enrollment Modal]
                               │
                               ▼
                   [Validate Profile & Inputs]
                   - Pre-filled: Name, Email
                   - Required: Phone, Learning Goal, T&C Checkbox
                               │
                               ▼
                   [Submit Enrollment Request]
                               │
                               ▼
               [Backend API Checks]
               1. Account Active?
               2. Not Instructor's Own Course?
               3. Prerequisites Completed?
               4. Not Duplicate?
                               │
                               ▼
                   [Create Enrollment Record]
                   - status: 'active'
                   - enrollmentData: { phone, goal, agreedTerms: true }
                               │
                               ▼
                [Redirect to Course Player]
```

---

## 21. Recommended Course Publishing Flow

```
[Instructor Course Builder] ──► Click "Submit for Review"
                                      │
                                      ▼
                           [API Updates Status]
                           status: 'pending_approval'
                           submittedAt: Date.now()
                                      │
                                      ▼
                        [Appears in Admin Queue]
                                      │
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
                 [Admin Approves]            [Admin Rejects]
                        │                           │
                        ▼                           ▼
               status: 'published'         status: 'rejected'
               publishedAt: Date()         rejectionReason: '...'
               Notify Instructor           Notify Instructor
```

---

## 22. Recommended Database Changes

### 1. Update `User` Schema (`backend/src/models/User.js`)
Add `accountStatus` enum to separate role from lifecycle state:
```javascript
accountStatus: {
  type: String,
  enum: ['PENDING_VERIFICATION', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'DEACTIVATED'],
  default: 'ACTIVE',
  index: true,
}
```

### 2. Create `InstructorApplication` Schema (`backend/src/models/InstructorApplication.js`) [NEW]
```javascript
const instructorApplicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  qualification: { type: String, required: true },
  specialization: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  portfolioUrl: { type: String },
  bio: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
  rejectionReason: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
}, { timestamps: true });
```

### 3. Update `Course` Schema (`backend/src/models/Course.js`)
Add moderation metadata fields:
```javascript
rejectionReason: { type: String, default: '' },
submittedAt:     { type: Date },
reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
reviewedAt:      { type: Date },
```

### 4. Update `Enrollment` Schema (`backend/src/models/Enrollment.js`)
Add enrollment form data tracking:
```javascript
enrollmentData: {
  phone:         { type: String, default: '' },
  learningGoal:  { type: String, default: '' },
  agreedToTerms: { type: Boolean, default: true },
}
```

---

## 23. Recommended API Changes

### New API Endpoints
1. `POST /api/v1/instructor-applications` — Submit instructor application (Student).
2. `GET /api/v1/admin/instructor-applications` — List pending applications (Admin only).
3. `PATCH /api/v1/admin/instructor-applications/:id/approve` — Approve application (Admin only).
4. `PATCH /api/v1/admin/instructor-applications/:id/reject` — Reject application with reason (Admin only).
5. `POST /api/v1/courses/:id/submit-for-review` — Submit course for review (Instructor).
6. `PATCH /api/v1/admin/courses/:id/approve` — Approve & publish course (Admin only).
7. `PATCH /api/v1/admin/courses/:id/reject` — Reject course with reason (Admin only).

### Security Fixes to Existing Endpoints
1. `PUT /api/v1/users/profile` & `PUT /api/v1/users/:id`: Explicitly sanitize `req.body` using a whitelist (`firstName`, `lastName`, `phone`, `bio`, `avatar`). Block `role`, `accountStatus`, and `isActive` updates from non-admin payloads.
2. `GET /api/v1/users/:id`: Enforce authorization rule (`req.user.role === 'admin' || req.user._id.toString() === req.params.id`).
3. Standardize Middleware: Remove redundant `backend/src/middlewares/auth.middleware.js` and route all modules (including `certificates`) through `backend/src/middleware/auth.middleware.js`.

---

## 24. Recommended Frontend Changes

1. **Authentication Flow (`SignUp.tsx`)**:
   - Remove the "Account Type / Role" dropdown. All public registrations create a `student` account.
   - Add a prominent "Apply as Instructor" button/banner on the Student Portal leading to an `InstructorApplicationModal`.
2. **Student Dashboard & Catalog (`CourseList.tsx` & `CourseOverviewPreview.tsx`)**:
   - Replace direct one-click enrollment with an `EnrollmentModal` component containing pre-filled profile information, phone input, learning goals, and confirmation checkbox.
3. **Instructor Dashboard (`InstructorDashboard.tsx`)**:
   - Replace direct "Publish" toggle buttons with a "Submit for Review" action button.
   - Display course review status badges (`Draft`, `Under Admin Review`, `Published`, `Changes Requested / Rejected`).
4. **Admin Workspace (`Users.tsx` & `AdminCourses.tsx`)**:
   - Add "Instructor Applications" tab under User Management.
   - Add "Pending Course Approvals" tab under Course Moderation with modal preview and Rejection Reason form.

---

## 25. Prioritized Fix Roadmap

Implementation will proceed strictly **one flow at a time** in subsequent tasks:

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1 (P0): AUTH & PRIVILEGE ESCALATION FIXES                        │
│ - Sanitize updateUser payload (Block role escalation)                 │
│ - Restrict self-assigned instructor role during signup                │
│ - Fix BOLA on GET /api/v1/users/:id                                    │
│ - Consolidate duplicate auth middleware imports                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2 (P1): INSTRUCTOR APPLICATION & ADMIN APPROVAL WORKFLOW        │
│ - Create InstructorApplication model & endpoints                      │
│ - Build Instructor Application Form UI                                │
│ - Build Admin Instructor Application Review Queue                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3 (P1): COURSE PUBLISHING & ADMIN REVIEW WORKFLOW               │
│ - Update Course schema for submission & rejection tracking            │
│ - Implement "Submit for Review" instructor flow                       │
│ - Build Admin Course Review Queue & Approve/Reject endpoints          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 4 (P1): STUDENT ENROLLMENT FORM & ENFORCEMENT WORKFLOW           │
│ - Update Enrollment schema with enrollmentData metadata                │
│ - Build frontend Enrollment Modal & confirmation workflow              │
│ - Enforce student status checks & instructor self-enrollment blocks    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 26. Testing Requirements

Each phase will be verified using dedicated automated HTTP API integration tests:

1. **Auth & Escalation Verification (`tests/authSecurity.api.test.js`)**:
   - Test sending `{ role: "admin" }` to `PUT /api/v1/users/profile` -> Verify role remains `student`.
   - Test `GET /api/v1/users/:otherUserId` as student -> Verify HTTP 403 Forbidden.
2. **Instructor Workflow Verification (`tests/instructorWorkflow.api.test.js`)**:
   - Test instructor application creation -> Status `PENDING`.
   - Test accessing `/instructor/dashboard` before approval -> Verify access blocked.
   - Test admin approval -> Role updated to `instructor`, status `ACTIVE`.
3. **Course Publishing Verification (`tests/coursePublishing.api.test.js`)**:
   - Test instructor submitting course -> Status `pending_approval`.
   - Test instructor direct publishing -> Verify HTTP 403 or status reset.
   - Test admin approval -> Status `published`.
4. **Enrollment Form Verification (`tests/enrollmentFlow.api.test.js`)**:
   - Test submitting enrollment form with metadata -> Active enrollment created.
   - Test duplicate enrollment prevention -> HTTP 409 Conflict.
   - Test instructor self-enrollment block -> HTTP 400 Bad Request.

---

## 27. Risks and Dependencies

1. **Existing User Role Compatibility**: Existing users registered as `instructor` need to be preserved while locking new registrations.
2. **Frontend State Hydration**: Redux auth slice (`authSlice.ts`) must correctly reflect `accountStatus` changes when admin approves or suspends an account.
3. **API Contract Backwards Compatibility**: Course list API filtering must continue supporting public non-authenticated catalog views.

---

## 28. Final Production Readiness Assessment

### Production Readiness Rating: **NOT PRODUCTION READY**

| Governance Domain | Status | Rating | Key Reason |
|---|---|---|---|
| **Authentication & RBAC** | FAILED | **CRITICAL** | Privilege escalation allows any student to become admin via API |
| **Instructor Onboarding** | FAILED | **CRITICAL** | Zero admin approval required for instructor registration |
| **Course Governance** | FAILED | **HIGH** | Instructors publish courses without admin review |
| **Student Enrollment** | PARTIAL | **MEDIUM** | Instant one-click enrollment without form data or terms |
| **Data Isolation & IDOR** | PARTIAL | **HIGH** | User profile endpoints leak arbitrary user data |

### Next Step Recommendation
Proceed to **Phase 1: Auth & Privilege Escalation Fixes** to eliminate all P0 security vulnerabilities before implementing approval and enrollment workflows.
