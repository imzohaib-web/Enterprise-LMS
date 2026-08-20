# Student Course Learning Architecture & Security Isolation Audit

## Executive Summary
This document defines the restructured Student Learning Experience architecture in the Enterprise LMS. All learning content (Overview, Course Content, Lessons, Assessments, Assignments, Progress, Certificates) is strictly isolated to its respective course context.

---

## 1. Student Learning Flow

```
Authenticated Student
       │
       ▼
Student Dashboard / My Courses
       │
       ▼
Select Course (e.g. "Applied RAG" or "React Development")
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ DEDICATED COURSE LEARNING PAGE                          │
│ Route: /student/courses/:courseId                       │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Course Header: Title, Thumbnail, Instructor, % Done │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Navigation Tabs:                                        │
│  ├── [ Overview ]      -> /student/courses/:id/overview │
│  ├── [ Course Content] -> /student/courses/:id/content  │
│  ├── [ Assessments ]   -> /student/courses/:id/assessments
│  ├── [ Assignments ]   -> /student/courses/:id/assignments
│  ├── [ Progress ]      -> /student/courses/:id/progress │
│  └── [ Certificate ]   -> /student/courses/:id/certificate
└─────────────────────────────────────────────────────────┘
```

---

## 2. Updated Routes & Architecture

### Student Routes
- `/student/courses`: Enrolled Courses list ("My Courses")
- `/student/courses/:courseId`: Course Learning Page (defaults to Overview tab)
- `/student/courses/:courseId/overview`: Course details, syllabus summary, instructor info
- `/student/courses/:courseId/content`: Course sections, lesson player integration
- `/student/courses/:courseId/assessments`: Course-scoped quizzes & tests
- `/student/courses/:courseId/assessments/:id`: Course-scoped quiz detail & start prompt
- `/student/courses/:courseId/assessments/:id/take`: Interactive quiz attempt player
- `/student/courses/:courseId/assessments/:id/result`: Quiz attempt score & breakdown
- `/student/courses/:courseId/assignments`: Course-scoped practical assignments
- `/student/courses/:courseId/progress`: Course-scoped progress breakdown & metrics
- `/student/courses/:courseId/certificate`: Course-scoped certificate generation & status

### Legacy Route Redirects
- `/student/assessments` → Redirects to `/student/courses` (My Courses)
- `/student/assignments` → Redirects to `/student/courses` (My Courses)

---

## 3. Server-Side Security & Cross-Course IDOR Protection

Every learning resource endpoint enforces a **Zero-Trust Validation Pipeline**:

```
Client Request
      │
      ▼
1. Authenticate JWT (Student Identity)
      │
      ▼
2. Enrollment Check (Verify Student has Active/Completed Enrollment in courseId)
      │
      ▼
3. Resource-Course Matching (Verify requested resource belongs strictly to courseId)
      │
      ▼
   ALLOWED (200 OK) / DENIED (403 Forbidden)
```

### Authorization Rules Enforced in Controllers/Services:
1. **`GET /assessments` (`getAllQuizzes`)**:
   - For student role, requires active/completed enrollment in `courseId`.
   - Returns ONLY published assessments belonging to `courseId`.
2. **`GET /assessments/:id` (`getQuizById`)**:
   - Verifies quiz belongs to course AND student is enrolled in quiz's `courseId`.
   - Rejects request with `403 Forbidden` if `requestedCourseId` from query/route does not match `quiz.courseId`.
3. **`GET /assignments/course/:courseId` (`getCourseAssignments`)**:
   - Verifies active/completed student enrollment in `courseId` before returning assignments.
4. **`GET /assignments/:id` (`getAssignmentById`)**:
   - Verifies student enrollment in assignment's `courseId`.
   - Rejects cross-course access attempts with `403 Forbidden`.
5. **`GET /progress/course/:courseId` (`getCourseProgressDTO`)**:
   - Verifies student enrollment in `courseId`. Rejects unenrolled students with `403 Forbidden`.
6. **`POST /certificates/generate/:courseId` (`generateCertificate`)**:
   - Verifies student enrollment AND 100% course completion before generating certificate.

---

## 4. Frontend State Isolation

- All React Query cache keys include `courseId` (e.g. `['quizzes', courseId]`, `['assignments', courseId]`, `['courseProgress', courseId]`, `['courseDetail', courseId]`).
- Switching between Course A and Course B invalidates previous query caches and fetches fresh Course B data.
- Prevents stale flickering of Course A assessments or progress while viewing Course B.

---

## 5. Files Changed

### Backend Files
- [assessment.controller.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/assessments/assessment.controller.js)
- [assessment.service.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/assessments/assessment.service.js)
- [instructor.controller.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/instructor/instructor.controller.js)
- [instructor.service.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/instructor/instructor.service.js)
- [progress.service.js](file:///d:/Backend%20Development/Enterprise-LMS/backend/src/modules/progress/progress.service.js)

### Frontend Files
- [routes.ts](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/constants/routes.ts)
- [index.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/routes/index.tsx)
- [AppSidebar.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/layout/AppSidebar.tsx)
- [StudentDashboard.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/student-dashboard/pages/StudentDashboard.tsx)
- [CourseLearningPage.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/student-dashboard/pages/CourseLearningPage.tsx)
- [CourseOverviewTab.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/student-dashboard/components/CourseOverviewTab.tsx)
- [CourseContentTab.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/student-dashboard/components/CourseContentTab.tsx)
- [CourseAssessmentsTab.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/student-dashboard/components/CourseAssessmentsTab.tsx)
- [CourseAssignmentsTab.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/student-dashboard/components/CourseAssignmentsTab.tsx)
- [CourseProgressTab.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/student-dashboard/components/CourseProgressTab.tsx)
- [CourseCertificateTab.tsx](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/student-dashboard/components/CourseCertificateTab.tsx)
