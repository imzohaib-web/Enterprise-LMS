# Admin Console Features Audit

This document provides a comprehensive audit of every admin feature, sidebar navigation link, route definition, file path, current functionality status, and backend API integration across the Enterprise LMS Admin Console.

---

## 1. Executive Summary & Audit Matrix

| # | Sidebar Feature Name | Group | Route Path | File Path(s) | Functionality Status | API Integration Status |
|---|----------------------|-------|------------|--------------|----------------------|-----------------------|
| 1 | **Overview** | Dashboard | `/admin/dashboard` | `frontend/src/pages/Admin/Dashboard.tsx` | Real Functionality | Connected (`/admin/analytics/*`, `/users`) |
| 2 | **Platform Analytics** | Dashboard | `/admin/analytics` | `frontend/src/pages/Admin/Analytics.tsx` | Real Functionality | Connected (`/admin/analytics/*`, `/reports/*`) |
| 3 | **User Directory** | User Management | `/admin/users` | `frontend/src/pages/Admin/Users.tsx` | Real Functionality | Connected (`/users/*`, `/instructor-applications/*`) |
| 4 | **Student Roster** | User Management | `/instructor/students` | `frontend/src/features/instructor-dashboard/pages/StudentProgressPage.tsx` | Real Functionality (Shared) | Connected (`/instructor/students`, `/instructor/courses`) |
| 5 | **Course Catalog** | Course Management | `/courses` | `frontend/src/pages/Courses/CourseList.tsx` | Real Functionality (Shared) | Connected (`/courses`, `/courses/enrollments/me`) |
| 6 | **Create Course** | Course Management | `/courses/new` | `frontend/src/pages/Courses/CourseBuilder.tsx` | Real Functionality (Shared) | Connected (`/courses/*`, `/upload/*`) |
| 7 | **Learning Paths** | Learning Management | `/learning-paths` | `frontend/src/pages/LearningPaths/LearningPathList.tsx` | Real Functionality (Shared) | Connected (`/learning-paths/*`) |
| 8 | **Assessments & Quizzes** | Learning Management | `/assessments` | `frontend/src/features/assessments/pages/QuizList.tsx` | Real Functionality (Shared) | Connected (`/quizzes`) |
| 9 | **Certificates** | Learning Management | `/certificates` | `frontend/src/pages/CertificateVerification.tsx` | Real Functionality (Shared) | Connected (`/certificates/verify/:code`) |
| 10 | **Discussions Forum** | Learning Management | `/discussions` | `frontend/src/features/discussions/pages/Discussions.tsx` | Real Functionality (Shared) | Connected (`/discussions/*`, Socket.IO) |
| 11 | **Data Exporter** | Reports & Analytics | `/admin/reports` | `frontend/src/pages/Admin/Reports.tsx` | Real Functionality | Connected (`/reports/*`) |
| 12 | **Performance & Stats** | Reports & Analytics | `/instructor/statistics` | `frontend/src/features/instructor-dashboard/pages/StatisticsPage.tsx` | Real Functionality (Shared) | Connected (`/instructor/analytics`) |
| 13 | **System Settings** | Platform Management | `/admin/settings` | `frontend/src/pages/Admin/SystemSettings.tsx` | Client-side Form UI (Form Stub) | No API Endpoint Called |
| 14 | **Audit Logs & Security** | Platform Management | `/admin/audit-logs` | `frontend/src/pages/Admin/AuditLogs.tsx` | Real Functionality | Connected (`/admin/audit-logs`) |
| 15 | **System Notifications** | Platform Management | `/admin/notifications` | `frontend/src/features/notifications/pages/Notifications.tsx` | Real Functionality (Shared) | Connected (`/instructor/notifications/*`) |
| 16 | **Admin Profile** | Platform Management | `/admin/profile` | `frontend/src/pages/Admin/AdminProfile.tsx` | Partial / Client UI | Reads Redux Auth State |
| 17 | **Admin Course Moderation** | *(Unlinked Route)* | `/admin/courses` | `frontend/src/pages/Admin/AdminCourses.tsx` | Real Functionality | Connected (`/courses/*`, `/categories`) |

---

## 2. Detailed Feature Enumeration

### Group 1: Dashboard

#### 1. Overview
- **Feature Name**: Overview
- **Sidebar Group**: Dashboard (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/admin/dashboard` (`ADMIN.DASHBOARD`)
- **File Path(s)**:
  - [`frontend/src/pages/Admin/Dashboard.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Admin/Dashboard.tsx)
  - [`frontend/src/services/admin.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/admin.service.ts)
  - [`frontend/src/services/user.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/user.service.ts)
- **What It Actually Does Today**:
  - Renders the executive admin telemetry dashboard.
  - Displays 4 key metric cards: Total Users, Published Courses, Total Enrollments, and Completion Rate Index.
  - Renders 4 interactive ApexCharts:
    1. *Student Registration Velocity* (monthly registration area chart)
    2. *Enrollment vs Completion Velocity* (comparative area chart)
    3. *Catalog Enrollment Volume* (top courses bar chart)
    4. *Category Distribution* (donut chart)
  - Displays a *Recent System Directory* table listing top 10 registered user accounts with role badges and active status indicators.
  - Provides a direct quick link button to Open Analytics Suite (`/admin/analytics`).
- **API Endpoints Called**:
  - `GET /admin/analytics/overview` (via `adminService.getOverview()`)
  - `GET /admin/analytics/growth?months=6` (via `adminService.getStudentGrowth(6)`)
  - `GET /admin/analytics/enrollments?months=6` (via `adminService.getEnrollmentTrend(6)`)
  - `GET /admin/analytics/courses?limit=8` (via `adminService.getCoursePerformance(8)`)
  - `GET /admin/analytics/categories` (via `adminService.getCategoryBreakdown()`)
  - `GET /users?page=1&limit=10` (via `userService.listUsers()`)

#### 2. Platform Analytics
- **Feature Name**: Platform Analytics
- **Sidebar Group**: Dashboard (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/admin/analytics` (`ADMIN.ANALYTICS`)
- **File Path(s)**:
  - [`frontend/src/pages/Admin/Analytics.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Admin/Analytics.tsx)
  - [`frontend/src/services/admin.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/admin.service.ts)
- **What It Actually Does Today**:
  - Renders the platform operations and telemetry suite.
  - Includes a timeframe filter dropdown (`7d`, `30d`, `90d`, `ytd` corresponding to 1, 3, 6, and 12 months).
  - Includes a manual *Refresh Telemetry* button and *Export Suite CSV* report exporter button.
  - Displays 8 KPI metrics cards: Student Growth & Users, Course Performance Index, Monthly Enrollments, Completion Rate Index, Certificate Statistics, Quiz & Assessment Performance, Platform GMV Revenue Index, and Active Faculty Members.
  - Renders 4 ApexCharts with full-screen modal zoom buttons:
    1. *Student Growth Trajectory*
    2. *Monthly Enrollment & Completion Velocity*
    3. *Top Course Enrollment Volume*
    4. *Category Market Share*
  - Includes 2 interactive leaderboards with click-to-open drill-down drawers for Course Performance Telemetry and Instructor Performance Telemetry.
- **API Endpoints Called**:
  - `GET /admin/analytics/overview` (via `adminService.getOverview()`)
  - `GET /admin/analytics/growth?months={months}` (via `adminService.getStudentGrowth()`)
  - `GET /admin/analytics/enrollments?months={months}` (via `adminService.getEnrollmentTrend()`)
  - `GET /admin/analytics/courses?limit=10` (via `adminService.getCoursePerformance(10)`)
  - `GET /admin/analytics/instructors?limit=10` (via `adminService.getInstructorPerformance(10)`)
  - `GET /admin/analytics/categories` (via `adminService.getCategoryBreakdown()`)
  - `GET /reports/progress?format=csv` (via `adminService.exportReport('progress', 'csv')`)

---

### Group 2: User Management

#### 3. User Directory
- **Feature Name**: User Directory
- **Sidebar Group**: User Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/admin/users` (`ADMIN.USERS`)
- **File Path(s)**:
  - [`frontend/src/pages/Admin/Users.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Admin/Users.tsx)
  - [`frontend/src/services/user.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/user.service.ts)
  - [`frontend/src/services/instructorApplication.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/instructorApplication.service.ts)
- **What It Actually Does Today**:
  - Dual-tab management interface:
    1. **User Directory Tab**: Full paginated user directory table with search by first name/last name/email, role filter (student, instructor, admin), status filter (active/inactive), page size selector, selection checkboxes for multi-user selection, floating bulk action bar (Bulk Activate, Bulk Deactivate, Export Selected CSV, Bulk Delete), Create New User modal, Edit User profile modal, View User details drawer, Delete user confirmation modal, Batch CSV Import modal, and Export CSV button.
    2. **Instructor Applications Queue Tab**: List of applicant applications filtered by status (`PENDING`, `APPROVED`, `REJECTED`, `ALL`), view applicant qualifications/experience/portfolio link/bio, Approve & Promote applicant button, and Reject applicant modal with custom rejection reason text area.
- **API Endpoints Called**:
  - `GET /users?page={page}&limit={limit}&search={search}&role={role}&isActive={isActive}` (via `userService.listUsers()`)
  - `POST /users` (via `userService.createUser()`)
  - `PUT /users/:id` (via `userService.updateUser()`)
  - `PATCH /users/:id/status` (via `userService.updateUserStatus()`)
  - `DELETE /users/:id` (via `userService.deleteUser()`)
  - `GET /instructor-applications?status={status}` (via `instructorApplicationService.listApplications()`)
  - `POST /instructor-applications/:id/approve` (via `instructorApplicationService.approveApplication()`)
  - `POST /instructor-applications/:id/reject` (via `instructorApplicationService.rejectApplication()`)

#### 4. Student Roster
- **Feature Name**: Student Roster
- **Sidebar Group**: User Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/instructor/students` (`INSTRUCTOR.STUDENTS`)
- **File Path(s)**:
  - [`frontend/src/features/instructor-dashboard/pages/StudentProgressPage.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/instructor-dashboard/pages/StudentProgressPage.tsx)
  - [`frontend/src/features/instructor-dashboard/hooks/useInstructorDashboard.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/instructor-dashboard/hooks/useInstructorDashboard.ts)
- **What It Actually Does Today**:
  - Shared instructor/admin roster page listing enrolled students.
  - Search input (by student name, email, or course name) and course dropdown filter.
  - Table showing student avatar, name, email, course title, progress bar percentage, completed module count, average quiz score, status badge, and last active timestamp.
  - Sortable table columns (by name, course, progress %, avg score, last active).
  - *Export Roster (CSV)* button.
  - *View Details* modal displaying overview stats, quiz attempts history with pass/fail badges, assignment submissions with download links, and a learning activity timeline.
  - *Message* modal to send direct discussion notes to students.
- **API Endpoints Called**:
  - `GET /instructor/students` (via `useStudentProgressList()`)
  - `GET /instructor/courses` (via `useInstructorCourses()`)
  - `POST /discussions` (via `useCreateDiscussion()`)

---

### Group 3: Course Management

#### 5. Course Catalog
- **Feature Name**: Course Catalog
- **Sidebar Group**: Course Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/courses` (`COURSES.LIST`)
- **File Path(s)**:
  - [`frontend/src/pages/Courses/CourseList.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Courses/CourseList.tsx)
  - [`frontend/src/services/course.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/course.service.ts)
- **What It Actually Does Today**:
  - Shared public/portal course directory.
  - Tab switcher ("All Courses" vs "My Courses" for students).
  - Search input (title or topic) and difficulty level dropdown filter (`beginner`, `intermediate`, `advanced`).
  - Grid of course cards showing course thumbnail, title, instructor name, rating, enrollment count, pricing/free pill, and enrollment action.
  - Includes *New Course* button linking to `/courses/new` for admins and instructors.
  - Paginated navigation controls.
- **API Endpoints Called**:
  - `GET /courses?page={page}&limit=12&search={search}&level={level}&status={status}` (via `courseService.listCourses()`)
  - `GET /courses/enrollments/me` (via `courseService.getMyEnrollments()`)
  - `POST /courses/:id/enroll` (via `courseService.enrollInCourse()`)

#### 6. Create Course
- **Feature Name**: Create Course
- **Sidebar Group**: Course Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/courses/new` (`COURSES.NEW`)
- **File Path(s)**:
  - [`frontend/src/pages/Courses/CourseBuilder.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Courses/CourseBuilder.tsx)
  - [`frontend/src/services/course.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/course.service.ts)
- **What It Actually Does Today**:
  - Full course creation and curriculum authoring page.
  - Course metadata form: Title, description, level (`beginner`, `intermediate`, `advanced`), price, free course toggle, publish status (`draft`, `published`, `archived`).
  - Thumbnail Uploader supporting image URL or local file upload.
  - Curriculum builder section (when editing):
    - Section CRUD via `SectionAccordion` (add, edit, delete sections).
    - Lesson CRUD (video, pdf, text, article, assignment, quiz) with file uploader and progress bar tracking, free preview toggle, and ordering.
  - Preview Course button (`/courses/:id`).
- **API Endpoints Called**:
  - `POST /courses` (via `courseService.createCourse()`)
  - `PUT /courses/:id` (via `courseService.updateCourse()`)
  - `GET /courses/:id` (via `courseService.getCourseById()`)
  - `POST /courses/:id/thumbnail` (via `courseService.uploadThumbnail()`)
  - `POST /courses/:id/sections` (via `courseService.addSection()`)
  - `PUT /courses/:id/sections/:sectionId` (via `courseService.updateSection()`)
  - `DELETE /courses/:id/sections/:sectionId` (via `courseService.deleteSection()`)
  - `POST /courses/:id/sections/:sectionId/lessons` (via `courseService.addLesson()`)
  - `PUT /courses/:id/sections/:sectionId/lessons/:lessonId` (via `courseService.updateLesson()`)
  - `DELETE /courses/:id/sections/:sectionId/lessons/:lessonId` (via `courseService.deleteLesson()`)
  - `POST /upload/video` (via `courseService.uploadVideo()`)
  - `POST /upload/document` (via `courseService.uploadDocument()`)

---

### Group 4: Learning Management

#### 7. Learning Paths
- **Feature Name**: Learning Paths
- **Sidebar Group**: Learning Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/learning-paths` (`LEARNING_PATHS.LIST`)
- **File Path(s)**:
  - [`frontend/src/pages/LearningPaths/LearningPathList.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/LearningPaths/LearningPathList.tsx)
  - [`frontend/src/services/learningPath.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/learningPath.service.ts)
- **What It Actually Does Today**:
  - Shared Learning Paths catalog page.
  - Search bar and level filter tabs (`all`, `beginner`, `intermediate`, `advanced`).
  - *Create Learning Path* button linking to `/learning-paths/new` for admins and instructors.
  - Cards displaying path title, description, thumbnail/gradient banner, level pill, publication status badge, list of assigned courses with order badges, enrollment count, creation date, *View Path* link (`/learning-paths/:id`), and *Enroll* button for students.
- **API Endpoints Called**:
  - `GET /learning-paths?level={level}&search={search}` (via `learningPathService.listLearningPaths()`)
  - `POST /learning-paths/:id/enroll` (via `learningPathService.enrollInLearningPath()`)

#### 8. Assessments & Quizzes
- **Feature Name**: Assessments & Quizzes
- **Sidebar Group**: Learning Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/assessments` (`ASSESSMENTS`)
- **File Path(s)**:
  - [`frontend/src/features/assessments/pages/QuizList.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/assessments/pages/QuizList.tsx)
  - [`frontend/src/features/assessments/api/assessmentApi.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/assessments/api/assessmentApi.ts)
- **What It Actually Does Today**:
  - Shared quiz catalog rendering a grid of available course assessments.
  - Search input for filtering quizzes by title or description.
  - Loading skeleton state and error retry state.
  - Quiz cards displaying quiz title, description, question count, pass score, time limit, and click handler to view details/take quiz (`/student/assessments/:id`).
- **API Endpoints Called**:
  - `GET /quizzes` (via `useQuizzes()`)

#### 9. Certificates
- **Feature Name**: Certificates
- **Sidebar Group**: Learning Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/certificates` (`CERTIFICATES`)
- **File Path(s)**:
  - [`frontend/src/pages/CertificateVerification.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/CertificateVerification.tsx)
  - [`frontend/src/services/certificateService.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/certificateService.ts)
- **What It Actually Does Today**:
  - Official Certificate Verification Portal.
  - Auto-reads verification code from query parameters (`?code=...`) or route parameters (`/verify/:verificationCode`).
  - Verification code search input form.
  - *Success State*: Green border card displaying student name, course name, issue date, instructor name, official credential badge, verification code, and PDF download button (`View / Download Official PDF`).
  - *Error State*: Red error card explaining why a certificate code is invalid or not found in registry.
- **API Endpoints Called**:
  - `GET /certificates/verify/:code` (via `verifyCertificate(code)`)

#### 10. Discussions Forum
- **Feature Name**: Discussions Forum
- **Sidebar Group**: Learning Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/discussions` (`DISCUSSIONS`)
- **File Path(s)**:
  - [`frontend/src/features/discussions/pages/Discussions.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/discussions/pages/Discussions.tsx)
  - [`frontend/src/features/discussions/hooks/useDiscussions.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/discussions/hooks/useDiscussions.ts)
- **What It Actually Does Today**:
  - Course discussions forum hub.
  - Course dropdown selector (`All Courses` or specific course).
  - Search bar, filter tabs (`all`, `unresolved`, `resolved`, `my_posts`), and sort dropdown (`latest`, `popular`, `most_replied`).
  - *New Discussion* composer modal.
  - Real-time Socket.IO WebSocket listener for new posts, replies, and likes.
  - Interactive thread view with author details, body text, tags, likes, pin/lock toggles for instructor/admin, reply composer, nested replies, edit reply, and delete reply.
- **API Endpoints Called**:
  - `GET /discussions?courseId={id}&search={search}&filter={filter}&sort={sort}&page={page}` (via `useDiscussions()`)
  - `GET /discussions/:id` (via `useDiscussion()`)
  - `POST /discussions` (via `useCreateDiscussion()`)
  - `PUT /discussions/:id` (via `useUpdateDiscussion()`)
  - `DELETE /discussions/:id` (via `useDeleteDiscussion()`)
  - `POST /discussions/:id/like` (via `useLikeDiscussion()`)
  - `POST /discussions/:id/pin` (via `usePinDiscussion()`)
  - `POST /discussions/:id/lock` (via `useLockDiscussion()`)
  - `POST /discussions/:id/replies` (via `useCreateReply()`)
  - `PUT /discussions/replies/:replyId` (via `useUpdateReply()`)
  - `DELETE /discussions/replies/:replyId` (via `useDeleteReply()`)
  - `POST /discussions/replies/:replyId/like` (via `useLikeReply()`)

---

### Group 5: Reports & Analytics

#### 11. Data Exporter
- **Feature Name**: Data Exporter
- **Sidebar Group**: Reports & Analytics (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/admin/reports` (`ADMIN.REPORTS`)
- **File Path(s)**:
  - [`frontend/src/pages/Admin/Reports.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Admin/Reports.tsx)
  - [`frontend/src/services/admin.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/admin.service.ts)
- **What It Actually Does Today**:
  - Executive data exporter console.
  - Displays 3 report generator cards:
    1. *Student Report* (exports all registered students with account status & registration date)
    2. *Course Report* (exports all courses with enrollment counts, completion rates, and instructor info)
    3. *Progress Report* (exports all student enrollment records with progress percentages and completion status)
  - Each card provides dual **CSV** and **PDF** download buttons with loading spinners that fetch report binary blobs from backend endpoints and trigger browser file downloads.
- **API Endpoints Called**:
  - `GET /reports/students?format={csv|pdf}` (via `adminService.exportReport('students', format)`)
  - `GET /reports/courses?format={csv|pdf}` (via `adminService.exportReport('courses', format)`)
  - `GET /reports/progress?format={csv|pdf}` (via `adminService.exportReport('progress', format)`)

#### 12. Performance & Stats
- **Feature Name**: Performance & Stats
- **Sidebar Group**: Reports & Analytics (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/instructor/statistics` (`INSTRUCTOR.STATISTICS`)
- **File Path(s)**:
  - [`frontend/src/features/instructor-dashboard/pages/StatisticsPage.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/instructor-dashboard/pages/StatisticsPage.tsx)
  - [`frontend/src/features/instructor-dashboard/hooks/useInstructorDashboard.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/instructor-dashboard/hooks/useInstructorDashboard.ts)
- **What It Actually Does Today**:
  - Shared instructor analytics & performance page accessible to Admins.
  - Displays 8 KPI cards: Total Students, Active Courses, Course Completion Rate (with progress bar), Average Quiz Score (with progress bar), Assessment Attempts, Student Progress, Learning Path Completion, and Discussion Activity.
  - Renders 4 ApexCharts:
    1. *Monthly Enrollments* (smooth line chart)
    2. *Quiz Performance* (grouped bar chart for avg score vs pass rate)
    3. *Course Completion Trend* (gradient area chart for completed vs in-progress modules)
    4. *Weekly Student Activity* (engagement bar chart by day)
  - Includes a *Refresh Analytics* button.
- **API Endpoints Called**:
  - `GET /instructor/analytics` (via `useInstructorAnalytics()`)

---

### Group 6: Platform Management

#### 13. System Settings
- **Feature Name**: System Settings
- **Sidebar Group**: Platform Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/admin/settings` (`ADMIN.SETTINGS`)
- **File Path(s)**:
  - [`frontend/src/pages/Admin/SystemSettings.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Admin/SystemSettings.tsx)
- **What It Actually Does Today**:
  - Client-side Form UI / Local Component State (Form UI Stub).
  - 8-tab settings management interface:
    1. *General & Platform*: Platform Name, Support Email, Default Language, Timezone, Currency, Default User Role.
    2. *Email & SMTP*: SMTP Server Host, Port, User, Password, From Email, From Name, TLS Encryption checkbox.
    3. *Security & Auth*: Session Timeout (Mins), Max Failed Login Attempts, Min Password Length, IP Whitelist, Enforce 2FA for Admins checkbox.
    4. *JWT & Sessions*: JWT Secret Key, Access Token Expiry, Refresh Token Expiry (Days).
    5. *Storage & Cloudinary*: Cloudinary Cloud Name, API Key, API Secret, Max Upload Size (MB), Allowed Extensions.
    6. *Redis Engine*: Redis Host, Port, Cache TTL, Key Prefix.
    7. *Branding & UI*: Brand Title, Primary Color Hex, Logo URL, Dark Mode.
    8. *Maintenance & Flags*: Maintenance Mode toggle with message textarea, Public Registration toggle, Quiz Auto Grading toggle, Certificate Auto Issue toggle.
  - Includes *Save Section Configuration* form submission triggering a Save Confirmation Modal and success toast feedback, and a *Reset to Defaults* button.
  - **Note**: Form inputs manage local React state and display toast feedback, but changes are not currently sent to or persisted by a backend system settings API endpoint.
- **API Endpoints Called**:
  - *None* (Client-side form state with toast notifications)

#### 14. Audit Logs & Security
- **Feature Name**: Audit Logs & Security
- **Sidebar Group**: Platform Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/admin/audit-logs` (`ADMIN.AUDIT_LOGS`)
- **File Path(s)**:
  - [`frontend/src/pages/Admin/AuditLogs.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Admin/AuditLogs.tsx)
  - [`frontend/src/services/admin.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/admin.service.ts)
- **What It Actually Does Today**:
  - Platform Security & Audit Telemetry dashboard.
  - 4 KPI cards: Total Event Entries, Authentication Events, Admin & Role Mutations, and Security Alerts.
  - Search bar (action, user name, email, IP), Category dropdown (`auth`, `user`, `course`, `certificate`, `report`, `system`), and Severity dropdown (`info`, `warning`, `critical`).
  - Paginated audit log table with severity indicator dots, action code, category badge, performer info, affected resource, origin IP address, and timestamp.
  - *Export Audit Logs (CSV)* button.
  - *Inspect* button opening a slide-over drawer displaying full log metadata, UTC timestamp, User Agent string, and formatted JSON event details payload.
- **API Endpoints Called**:
  - `GET /admin/audit-logs?page={page}&limit={limit}&search={search}&category={category}&severity={severity}` (via `adminService.getAuditLogs()`)

#### 15. System Notifications
- **Feature Name**: System Notifications
- **Sidebar Group**: Platform Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/admin/notifications` (`ADMIN.NOTIFICATIONS`)
- **File Path(s)**:
  - [`frontend/src/features/notifications/pages/Notifications.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/notifications/pages/Notifications.tsx)
  - [`frontend/src/features/instructor-dashboard/hooks/useInstructorDashboard.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/instructor-dashboard/hooks/useInstructorDashboard.ts)
- **What It Actually Does Today**:
  - Notification Center rendering system alerts and notifications.
  - Unread badge counter (`Unread`).
  - *Mark All as Read* button.
  - List of notifications showing title, message, type badge (`assessment`, `enrollment`, `info`), unread dot, timestamp, and *Mark Read* button.
- **API Endpoints Called**:
  - `GET /instructor/notifications` (via `useInstructorNotifications()`)
  - `PATCH /instructor/notifications/:id/read` (via `useMarkNotificationRead()`)
  - `POST /instructor/notifications/mark-all-read` (via `useMarkAllNotificationsRead()`)

#### 16. Admin Profile
- **Feature Name**: Admin Profile
- **Sidebar Group**: Platform Management (`enterpriseAdminGroups` in `AppSidebar.tsx`)
- **Route Path**: `/admin/profile` (`ADMIN.PROFILE`)
- **File Path(s)**:
  - [`frontend/src/pages/Admin/AdminProfile.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Admin/AdminProfile.tsx)
  - [`frontend/src/features/auth/authSlice.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/features/auth/authSlice.ts)
- **What It Actually Does Today**:
  - Partial / Client-side UI.
  - Header banner displaying current admin initials avatar, full name, role badge ("Super Administrator"), email, and 2FA status indicator button.
  - 4 tabs:
    1. *Account Details*: Personal Identity form (First Name, Last Name, Email) with *Save Profile Changes* button triggering a simulated save toast.
    2. *Security & Password*: Password reset request button triggering a toast.
    3. *Admin Permissions*: List of system admin capabilities (Full Database Access, User Management, Reports Exporters).
    4. *Activity Logs*: Text statement regarding admin compliance logging.
  - **Note**: Form inputs populate from Redux `selectCurrentUser`. Save and password reset actions display success toasts but do not dispatch a backend API update request.
- **API Endpoints Called**:
  - *None* (Reads Redux auth state `selectCurrentUser`)

---

### Unlinked / Dedicated Admin Routes (Not in Sidebar)

#### 17. Admin Course Moderation & Management
- **Feature Name**: Admin Course Moderation
- **Sidebar Group**: *Unlinked in Admin Sidebar* (Sidebar links to `/courses` and `/courses/new` instead under Course Management)
- **Route Path**: `/admin/courses` (`ADMIN.COURSES`)
- **File Path(s)**:
  - [`frontend/src/pages/Admin/AdminCourses.tsx`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/pages/Admin/AdminCourses.tsx)
  - [`frontend/src/services/course.service.ts`](file:///d:/Backend%20Development/Enterprise-LMS/frontend/src/services/course.service.ts)
- **What It Actually Does Today**:
  - Dedicated Admin Course Moderation console.
  - Workflow filter tabs: `All Courses`, `Pending Approval`, `Published`, `Drafts`, `Archived`, `Featured Only`.
  - Search bar (title or keywords), level filter (`beginner`, `intermediate`, `advanced`), category filter dropdown, and sort dropdown (`createdAt`, `enrollmentCount`, `averageRating`, `price`).
  - Course table listing thumbnail, title, featured badge, instructor name, category, level, publication status, enrollment count, and quick action buttons:
    - *Pending Submission*: Approve button (publishes course) and Reject button (opens rejection reason feedback modal).
    - *Draft*: Publish button.
    - *Published*: Unpublish button (reverts to draft).
    - *Archived*: Archive button.
    - *Featured*: Toggle Featured ⭐ status button.
    - *Duplicate*: Duplicate course as draft copy button.
    - *Builder*: Link to Course Builder (`/courses/:id/builder`).
    - *Delete*: Permanent delete confirmation modal.
  - Course Details Drawer displaying full course overview, price, level, description, and link to builder.
- **API Endpoints Called**:
  - `GET /categories` (via `courseService.listCategories()`)
  - `GET /courses?page={page}&limit={limit}&search={search}&level={level}&category={category}&status={status}&isFeatured={isFeatured}&sortBy={sortBy}&order=desc` (via `courseService.listCourses()`)
  - `PUT /courses/:id` (via `courseService.updateCourse()`)
  - `POST /courses` (via `courseService.createCourse()`)
  - `DELETE /courses/:id` (via `courseService.deleteCourse()`)
  - `POST /courses/:id/approve` (via `courseService.approveCourse()`)
  - `POST /courses/:id/reject` (via `courseService.rejectCourse()`)

---

## 3. Summary of Findings

1. **Sidebar Navigation Coverage**:
   - Out of the 16 menu items listed in `enterpriseAdminGroups` in `AppSidebar.tsx`, **14 features have full real backend functionality**, **1 feature (System Settings) operates as a client-side form UI stub**, and **1 feature (Admin Profile) operates as a client-side UI displaying Redux auth state**.
   - Zero menu items are dead links or empty placeholder pages.

2. **Shared Features vs Admin-Specific Features**:
   - **Admin-Specific Pages**: `Dashboard` (`/admin/dashboard`), `Platform Analytics` (`/admin/analytics`), `User Directory` (`/admin/users`), `Data Exporter` (`/admin/reports`), `System Settings` (`/admin/settings`), `Audit Logs` (`/admin/audit-logs`), `Admin Profile` (`/admin/profile`), and `Admin Course Moderation` (`/admin/courses`).
   - **Shared Features Linked in Admin Sidebar**: `Student Roster` (`/instructor/students`), `Course Catalog` (`/courses`), `Create Course` (`/courses/new`), `Learning Paths` (`/learning-paths`), `Assessments & Quizzes` (`/assessments`), `Certificates` (`/certificates`), `Discussions Forum` (`/discussions`), `Performance & Stats` (`/instructor/statistics`), and `System Notifications` (`/admin/notifications` rendering `Notifications.tsx`).

3. **Unlinked Dedicated Admin Page**:
   - `AdminCourses.tsx` (`/admin/courses`) is fully implemented with approval/rejection moderation workflows, featured toggling, duplication, and filtering. However, the sidebar under *Course Management* links to public/student routes (`/courses` and `/courses/new`) rather than `/admin/courses`.

---
*Audit completed on: 2026-08-21*
