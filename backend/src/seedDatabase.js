'use strict';
require('dotenv').config();
const connectDB = require('./config/db');
const { User, Course, Category, Enrollment, LearningPath, Certificate, Notification, Discussion } = require('./models');
const { QuizModel } = require('./modules/assessments/assessment.model');
const { StudentProgressModel } = require('./modules/progress/progress.model');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Seeding database...');

    // 1. Seed Categories
    let category = await Category.findOne({ slug: 'software-engineering' });
    if (!category) {
      category = await Category.create({
        name: 'Software Engineering',
        slug: 'software-engineering',
        description: 'Full-stack engineering, cloud, and modern web development.',
        icon: 'code',
      });
      console.log('✅ Created Category: Software Engineering');
    }

    // 2. Seed Instructor User
    let instructor = await User.findOne({ email: 'instructor@enterprise.lms' });
    if (!instructor) {
      instructor = await User.create({
        firstName: 'Dr. Elena',
        lastName: 'Rostova',
        email: 'instructor@enterprise.lms',
        password: 'InstructorPassword123!',
        role: 'instructor',
        isActive: true,
      });
      console.log('✅ Created Instructor');
    }

    // 3. Seed Admin User
    let admin = await User.findOne({ email: 'admin@enterprise.lms' });
    if (!admin) {
      admin = await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@enterprise.lms',
        password: 'AdminPassword123!',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Created Admin');
    }

    // 4. Seed Student User
    let student = await User.findOne({ email: 'student@enterprise.lms' });
    if (!student) {
      student = await User.create({
        firstName: 'Alex',
        lastName: 'Student',
        email: 'student@enterprise.lms',
        password: 'StudentPassword123!',
        role: 'student',
        phone: '+1-555-0192',
        studentId: 'STU-2026-8841',
        department: 'Computer Science',
        bio: 'Aspiring Full Stack Engineer and Cloud Architect.',
        isActive: true,
      });
      console.log('✅ Created Student');
    }

    // 5. Seed Courses
    let courses = await Course.find();
    if (courses.length === 0) {
      const coursesToInsert = [
        {
          title: 'Advanced React 19 & Enterprise Architecture',
          slug: 'advanced-react-19-enterprise-architecture',
          description: 'Master React 19 Server Components, Concurrent Mode, Redux Toolkit, and scalable state management.',
          shortDesc: 'Production React 19 & State Architecture',
          level: 'advanced',
          language: 'English',
          price: 0,
          isFree: true,
          status: 'published',
          category: category._id,
          instructor: instructor._id,
          tags: ['react', 'frontend', 'typescript'],
          sections: [
            {
              title: 'Module 1: React 19 Core Fundamentals',
              description: 'Understanding actions, useTransition, and useOptimistic.',
              order: 1,
              lessons: [
                { title: 'Lesson 1: Introduction to React 19', type: 'video', duration: 600, order: 1 },
                { title: 'Lesson 2: Server Actions & Custom Hooks', type: 'video', duration: 900, order: 2 },
              ],
            },
          ],
        },
        {
          title: 'Node.js Microservices & Event-Driven Systems',
          slug: 'nodejs-microservices-event-driven-systems',
          description: 'Build high-performance asynchronous Node.js microservices with Redis, MongoDB, and Docker.',
          shortDesc: 'Scalable Microservices with Node.js & Docker',
          level: 'intermediate',
          language: 'English',
          price: 49,
          isFree: false,
          status: 'published',
          category: category._id,
          instructor: instructor._id,
          tags: ['nodejs', 'backend', 'mongodb', 'docker'],
          sections: [
            {
              title: 'Module 1: Asynchronous Architecture',
              description: 'Event loop tuning and worker threads.',
              order: 1,
              lessons: [
                { title: 'Lesson 1: Event Loop Optimization', type: 'video', duration: 800, order: 1 },
              ],
            },
          ],
        },
        {
          title: 'Python for Data Science & Neural Networks',
          slug: 'python-data-science-neural-networks',
          description: 'Learn NumPy, Pandas, PyTorch, and deep neural network training from scratch.',
          shortDesc: 'Data Science & PyTorch Deep Learning',
          level: 'beginner',
          language: 'English',
          price: 0,
          isFree: true,
          status: 'published',
          category: category._id,
          instructor: instructor._id,
          tags: ['python', 'ai', 'datascience'],
          sections: [
            {
              title: 'Module 1: Python Data Foundations',
              description: 'Data wrangling with Pandas.',
              order: 1,
              lessons: [
                { title: 'Lesson 1: Data Structures in Python', type: 'text', duration: 400, order: 1 },
              ],
            },
          ],
        },
      ];

      courses = await Course.insertMany(coursesToInsert);
      console.log('✅ Created 3 Published Courses');
    }

    const reactCourse = courses[0];
    const nodeCourse = courses[1];
    const pythonCourse = courses[2];

    // 6. Seed Enrollments
    const existingEnrollments = await Enrollment.countDocuments({ student: student._id });
    if (existingEnrollments === 0) {
      const reactLessonId = reactCourse.sections[0]?.lessons[0]?._id;
      const nodeLessonId = nodeCourse.sections[0]?.lessons[0]?._id;
      const pythonLessonId = pythonCourse.sections[0]?.lessons[0]?._id;

      await Enrollment.create([
        {
          student: student._id,
          course: reactCourse._id,
          status: 'active',
          progressPercentage: 75,
          completedLessons: reactLessonId ? [reactLessonId] : [],
        },
        {
          student: student._id,
          course: nodeCourse._id,
          status: 'active',
          progressPercentage: 40,
          completedLessons: nodeLessonId ? [nodeLessonId] : [],
        },
        {
          student: student._id,
          course: pythonCourse._id,
          status: 'completed',
          progressPercentage: 100,
          completedLessons: pythonLessonId ? [pythonLessonId] : [],
        },
      ]);
      console.log('✅ Seeded Enrollments for student');
    }

    // 7. Seed Quizzes/Assessments
    const existingQuizzes = await QuizModel.countDocuments();
    if (existingQuizzes === 0) {
      await QuizModel.create([
        {
          title: 'React 19 Hooks & Server Components Comprehensive Assessment',
          description: 'Evaluate your knowledge on useActionState, useOptimistic, and React 19 server architecture.',
          courseId: reactCourse._id,
          timeLimitMinutes: 20,
          passingScore: 70,
          questions: [
            {
              question: 'Which new hook in React 19 handles form state and async pending transitions?',
              options: ['useActionState', 'useFormStatus', 'useOptimistic', 'useAsyncState'],
              correctAnswer: 'useActionState',
              marks: 5,
              explanation: 'useActionState is the official React 19 replacement for custom async form state handling.',
              difficulty: 'medium',
            },
            {
              question: 'What is the primary benefit of React Server Components (RSC)?',
              options: [
                'Zero bundle-size overhead for server-only components',
                'Automatic CSS compilation',
                'Replaces Redux state management completely',
                'Eliminates the need for API endpoints entirely',
              ],
              correctAnswer: 'Zero bundle-size overhead for server-only components',
              marks: 5,
              explanation: 'RSC runs on the server and does not send its code dependencies to the client bundle.',
              difficulty: 'easy',
            },
          ],
        },
        {
          title: 'Node.js Event Loop & Microservices Architecture Quiz',
          description: 'Assess event loop phases, worker threads, and cluster scaling techniques in Node.js.',
          courseId: nodeCourse._id,
          timeLimitMinutes: 15,
          passingScore: 75,
          questions: [
            {
              question: 'Which phase of the Node.js event loop executes setImmediate() callbacks?',
              options: ['Check Phase', 'Timers Phase', 'Poll Phase', 'Close Callbacks Phase'],
              correctAnswer: 'Check Phase',
              marks: 5,
              explanation: 'setImmediate callbacks are processed during the Check phase of the event loop.',
              difficulty: 'hard',
            },
          ],
        },
      ]);
      console.log('✅ Seeded Quizzes');
    }

    // 8. Seed Learning Paths
    const existingPaths = await LearningPath.countDocuments();
    if (existingPaths === 0) {
      await LearningPath.create([
        {
          title: 'Full Stack JavaScript Architect',
          slug: 'full-stack-javascript-architect',
          description: 'Complete roadmap from React 19 frontend mastery to Node.js microservices backend architecture.',
          level: 'advanced',
          category: category._id,
          creator: instructor._id,
          isPublished: true,
          estimatedHours: 40,
          courses: [
            { course: reactCourse._id, order: 0, isRequired: true },
            { course: nodeCourse._id, order: 1, isRequired: true },
          ],
          enrolledStudents: [student._id],
          enrollmentCount: 1,
        },
        {
          title: 'AI & Data Science Specialist Roadmap',
          slug: 'ai-data-science-specialist-roadmap',
          description: 'From Python fundamentals to neural networks, model deployment, and MLOps pipeline engineering.',
          level: 'beginner',
          category: category._id,
          creator: instructor._id,
          isPublished: true,
          estimatedHours: 30,
          courses: [
            { course: pythonCourse._id, order: 0, isRequired: true },
          ],
          enrolledStudents: [student._id],
          enrollmentCount: 1,
        },
      ]);
      console.log('✅ Seeded Learning Paths');
    }

    // 9. Seed Student Progress Records
    const existingProgress = await StudentProgressModel.countDocuments({ studentId: student._id });
    if (existingProgress === 0) {
      await StudentProgressModel.create([
        {
          studentId: student._id,
          courseId: reactCourse._id,
          completedLessons: ['Lesson 1: Introduction to React 19'],
          completedQuizzes: [],
          quizScores: [{ quizId: 'q1', score: 10, percentage: 100 }],
          overallScore: 100,
          progressPercentage: 75,
          completed: false,
          lastActivity: new Date(),
        },
        {
          studentId: student._id,
          courseId: pythonCourse._id,
          completedLessons: ['Lesson 1: Data Structures in Python'],
          completedQuizzes: ['q2'],
          quizScores: [{ quizId: 'q2', score: 5, percentage: 100 }],
          overallScore: 100,
          progressPercentage: 100,
          completed: true,
          completedAt: new Date(),
          lastActivity: new Date(),
        },
      ]);
      console.log('✅ Seeded Student Progress');
    }

    // 10. Seed Certificate
    const existingCerts = await Certificate.countDocuments({ studentId: student._id });
    if (existingCerts === 0) {
      await Certificate.create({
        studentId: student._id,
        courseId: pythonCourse._id,
        verificationCode: 'VERIFY-PY-8841',
        certificateUrl: '/uploads/certificates/cert-python.pdf',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        issuedAt: new Date(),
      });
      console.log('✅ Seeded Certificate');
    }

    // 11. Seed Discussions
    const existingDiscussions = await Discussion.countDocuments();
    if (existingDiscussions === 0) {
      await Discussion.create({
        courseId: reactCourse._id,
        authorId: student._id,
        title: 'Best practices for React 19 useActionState in forms?',
        content: 'Should we replace react-hook-form with useActionState for simple CRUD forms in Enterprise apps?',
        tags: ['react19', 'forms'],
        likes: [instructor._id],
        likesCount: 1,
      });
      console.log('✅ Seeded Discussions');
    }

    // 12. Seed Notifications
    const existingNotifs = await Notification.countDocuments({ userId: student._id });
    if (existingNotifs === 0) {
      await Notification.create([
        {
          userId: student._id,
          title: 'Welcome to Enterprise LMS! 🚀',
          message: 'Your student portal is fully operational. Continue your assigned courses and test your skills.',
          type: 'info',
          category: 'system',
          isRead: false,
        },
        {
          userId: student._id,
          title: 'Certificate Awarded 🎉',
          message: 'Congratulations! You earned a verified certificate in Python for Data Science.',
          type: 'success',
          category: 'certificate',
          isRead: true,
        },
      ]);
      console.log('✅ Seeded Notifications');
    }

    console.log('🎉 Enterprise LMS Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
