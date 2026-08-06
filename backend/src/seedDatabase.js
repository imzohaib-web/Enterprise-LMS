'use strict';
<<<<<<< HEAD
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('./config/db');
const { User, Course, Category } = require('./models');

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

    // Helper to create or reset user password
    const upsertUser = async (userData) => {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`✅ Created User: ${userData.email} / ${userData.password}`);
      } else {
        user.firstName = userData.firstName || user.firstName || 'User';
        user.lastName = userData.lastName || user.lastName || 'Account';
        user.password = userData.password;
        user.isActive = true;
        await user.save();
        console.log(`🔄 Reset Password for User: ${userData.email} / ${userData.password}`);
      }
      return user;
    };

    // 2. Seed Instructor Accounts
    const instructor = await upsertUser({
      firstName: 'Dr. Elena',
      lastName: 'Rostova',
      email: 'instructor@enterprise.lms',
      password: 'InstructorPassword123!',
      role: 'instructor',
      isActive: true,
    });

    await upsertUser({
      firstName: 'Dr. Sarah',
      lastName: 'Jenkins',
      email: 'instructor@lms.com',
      password: 'password123',
      role: 'instructor',
      isActive: true,
    });

    // 3. Seed Admin Accounts
    await upsertUser({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@enterprise.lms',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true,
    });

    await upsertUser({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lms.com',
      password: 'password123',
      role: 'admin',
      isActive: true,
    });

    // 4. Seed Student Accounts
    await upsertUser({
      firstName: 'Alex',
      lastName: 'Student',
      email: 'student@enterprise.lms',
      password: 'StudentPassword123!',
      role: 'student',
      isActive: true,
    });

    await upsertUser({
      firstName: 'Student',
      lastName: 'User',
      email: 'student@lms.com',
      password: 'password123',
      role: 'student',
      isActive: true,
    });

    // 5. Seed Courses
    const existingCoursesCount = await Course.countDocuments();
    if (existingCoursesCount === 0) {
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
        },
      ];
      await Course.insertMany(coursesToInsert);
      console.log('✅ Seeded initial courses.');
    }

    console.log('🎉 Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};
=======

const mongoose = require('mongoose');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Discussion = require('./models/Discussion');
const Notification = require('./models/Notification');
const LearningPath = require('./models/LearningPath');
const { QuizModel, QuizAttemptModel } = require('./modules/assessments/assessment.model');
const CertificateModel = require('./modules/certificates/certificate.model');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/enterprise_lms';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // Clear existing data in collections
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Discussion.deleteMany({});
    await Notification.deleteMany({});
    await LearningPath.deleteMany({});
    await QuizModel.deleteMany({});
    await QuizAttemptModel.deleteMany({});
    await CertificateModel.deleteMany({});

    console.log('Cleared previous database entries.');

    // 1. Create Instructor User
    const instructor = await User.create({
      _id: new mongoose.Types.ObjectId('661000000000000000000001'),
      name: 'Dr. Sarah Jenkins',
      email: 'instructor@lms.com',
      password: 'password123',
      role: 'instructor',
      avatar: '/images/user/owner.jpg',
      phone: '+1 (555) 234-5678',
      department: 'Computer Science & Software Engineering',
      qualification: 'Ph.D. in Computer Science',
      specialization: 'Cloud Architecture & Distributed Systems',
      experience: '12+ Years Industry & Research Experience',
      bio: 'Senior LMS Educator and System Architect specializing in scalable Node.js microservices, React UI frameworks, and cloud infrastructure.',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahjenkins-lms',
        github: 'https://github.com/sarahjenkins-lms',
        twitter: 'https://twitter.com/sarah_lms',
        website: 'https://sarahjenkins.dev',
      },
    });

    // Create 3 Students
    const student1 = await User.create({
      _id: new mongoose.Types.ObjectId('661000000000000000000002'),
      name: 'Alexander Wright',
      email: 'alex.wright@student.com',
      password: 'password123',
      role: 'student',
      avatar: '/images/user/user-01.jpg',
    });

    const student2 = await User.create({
      _id: new mongoose.Types.ObjectId('661000000000000000000003'),
      name: 'Sophia Martinez',
      email: 'sophia.m@student.com',
      password: 'password123',
      role: 'student',
      avatar: '/images/user/user-02.jpg',
    });

    const student3 = await User.create({
      _id: new mongoose.Types.ObjectId('661000000000000000000004'),
      name: 'David Chen',
      email: 'david.chen@student.com',
      password: 'password123',
      role: 'student',
      avatar: '/images/user/user-03.jpg',
    });

    console.log('Created Users (Instructor & Students).');

    // 2. Create Courses
    const course1 = await Course.create({
      title: 'Advanced Full-Stack Engineering with Node.js & React',
      description: 'Master enterprise web application architecture using Node.js, Express, MongoDB, and React with TypeScript.',
      category: 'Software Engineering',
      status: 'published',
      instructor: instructor._id,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      price: 199,
      difficulty: 'advanced',
      duration: '24 hours',
      tags: ['Node.js', 'React', 'MongoDB', 'TypeScript'],
      prerequisites: ['JavaScript ES6+', 'HTML5/CSS3'],
      learningOutcomes: ['Build enterprise REST APIs', 'Implement JWT authentication', 'Design scalable MongoDB schemas'],
      enrolledStudentsCount: 420,
      rating: 4.9,
      sections: [
        {
          title: 'Module 1: Enterprise Node.js Architecture',
          order: 1,
          lessons: [
            { title: 'Node.js Event Loop Deep Dive', duration: '20 mins', type: 'video', isPreview: true },
            { title: 'Express Routing & Middleware Design', duration: '35 mins', type: 'video' },
          ],
        },
        {
          title: 'Module 2: Database Design & Mongoose Aggregations',
          order: 2,
          lessons: [
            { title: 'MongoDB Schema Optimization', duration: '40 mins', type: 'video' },
            { title: 'Complex Aggregation Pipelines', duration: '45 mins', type: 'video' },
          ],
        },
      ],
    });

    const course2 = await Course.create({
      title: 'Enterprise Architecture & Microservices',
      description: 'Learn modern microservices design patterns, API gateways, event-driven systems, and distributed caching.',
      category: 'Cloud & Architecture',
      status: 'published',
      instructor: instructor._id,
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      price: 249,
      difficulty: 'advanced',
      duration: '18 hours',
      tags: ['Microservices', 'System Design', 'Docker', 'Redis'],
      enrolledStudentsCount: 310,
      rating: 4.8,
    });

    const course3 = await Course.create({
      title: 'Docker & Kubernetes for Production Engineering',
      description: 'Containerize, orchestrate, deploy, and scale fault-tolerant enterprise applications in cloud environments.',
      category: 'DevOps',
      status: 'published',
      instructor: instructor._id,
      thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
      price: 179,
      difficulty: 'intermediate',
      duration: '15 hours',
      tags: ['Docker', 'Kubernetes', 'CI/CD', 'DevOps'],
      enrolledStudentsCount: 280,
      rating: 4.7,
    });

    const course4 = await Course.create({
      title: 'Database Systems & SQL Optimization Mastery',
      description: 'In-depth database performance tuning, indexing strategies, query execution planning, and transactions.',
      category: 'Databases',
      status: 'draft',
      instructor: instructor._id,
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
      price: 149,
      difficulty: 'intermediate',
      duration: '12 hours',
      tags: ['SQL', 'PostgreSQL', 'Performance', 'Indexing'],
      enrolledStudentsCount: 0,
      rating: 5.0,
    });

    console.log('Created Courses.');

    // 3. Create Enrollments
    await Enrollment.create([
      {
        student: student1._id,
        course: course1._id,
        instructor: instructor._id,
        progressPercentage: 88,
        completedModules: 8,
        totalModules: 10,
        averageQuizScore: 94,
      },
      {
        student: student2._id,
        course: course1._id,
        instructor: instructor._id,
        progressPercentage: 72,
        completedModules: 6,
        totalModules: 10,
        averageQuizScore: 88,
      },
      {
        student: student3._id,
        course: course2._id,
        instructor: instructor._id,
        progressPercentage: 95,
        completedModules: 9,
        totalModules: 10,
        averageQuizScore: 96,
      },
    ]);

    console.log('Created Enrollments.');

    // 4. Create Assessments & Quizzes
    const quiz1 = await QuizModel.create({
      title: 'Node.js Event Loop & Async Architecture',
      description: 'Comprehensive quiz covering Node.js event queue, libuv, microtasks, and asynchronous non-blocking I/O.',
      courseId: course1._id,
      instructorId: instructor._id,
      type: 'quiz',
      status: 'published',
      timeLimitMinutes: 30,
      passingScore: 70,
      totalMarks: 100,
      attemptsAllowed: 3,
      questions: [
        {
          question: 'Which component of Node.js handles asynchronous I/O operations under the hood?',
          type: 'mcq',
          options: [
            { id: '1', text: 'V8 Engine' },
            { id: '2', text: 'libuv library' },
            { id: '3', text: 'npm Registry' },
            { id: '4', text: 'HTTP Parser' },
          ],
          correctAnswer: 'libuv library',
          marks: 25,
          explanation: 'libuv provides multi-platform support for asynchronous I/O operations.',
        },
        {
          question: 'Node.js is single-threaded for JavaScript execution.',
          type: 'true_false',
          options: [
            { id: '1', text: 'True' },
            { id: '2', text: 'False' },
          ],
          correctAnswer: 'True',
          marks: 25,
          explanation: 'JavaScript code runs on a single main event loop thread.',
        },
        {
          question: 'Explain the difference between process.nextTick() and setImmediate().',
          type: 'short_answer',
          marks: 50,
          explanation: 'process.nextTick() runs immediately after current operation completes before continuing event loop.',
        },
      ],
    });

    const quiz2 = await QuizModel.create({
      title: 'Microservices Communication Protocols',
      description: 'Assessment on gRPC, REST, RabbitMQ, Kafka, and event-driven architectural messaging.',
      courseId: course2._id,
      instructorId: instructor._id,
      type: 'quiz',
      status: 'published',
      timeLimitMinutes: 20,
      passingScore: 75,
      totalMarks: 100,
      attemptsAllowed: 2,
      questions: [
        {
          question: 'Which binary protocol is commonly used for high-performance microservices gRPC communication?',
          type: 'mcq',
          options: [
            { id: '1', text: 'JSON' },
            { id: '2', text: 'Protocol Buffers (Protobuf)' },
            { id: '3', text: 'XML' },
            { id: '4', text: 'YAML' },
          ],
          correctAnswer: 'Protocol Buffers (Protobuf)',
          marks: 50,
        },
      ],
    });

    console.log('Created Quizzes.');

    // 5. Create Quiz Attempts
    await QuizAttemptModel.create([
      {
        quizId: quiz1._id,
        studentId: student1._id,
        courseId: course1._id,
        instructorId: instructor._id,
        score: 95,
        totalMarks: 100,
        percentage: 95,
        passed: true,
        status: 'reviewed',
        correctAnswersCount: 3,
        wrongAnswersCount: 0,
        timeTakenSeconds: 840,
        answers: [
          { questionId: '1', selectedOption: 'libuv library', isCorrect: true, marksAwarded: 25 },
          { questionId: '2', selectedOption: 'True', isCorrect: true, marksAwarded: 25 },
          { questionId: '3', textAnswer: 'process.nextTick executes before any other microtasks.', isCorrect: true, marksAwarded: 45 },
        ],
      },
      {
        quizId: quiz2._id,
        studentId: student2._id,
        courseId: course2._id,
        instructorId: instructor._id,
        score: 85,
        totalMarks: 100,
        percentage: 85,
        passed: true,
        status: 'pending_review',
        correctAnswersCount: 1,
        wrongAnswersCount: 0,
        timeTakenSeconds: 620,
        answers: [
          { questionId: '1', selectedOption: 'Protocol Buffers (Protobuf)', isCorrect: true, marksAwarded: 50 },
        ],
      },
    ]);

    console.log('Created Quiz Attempts.');

    // 6. Create Discussions
    await Discussion.create([
      {
        course: course1._id,
        instructor: instructor._id,
        author: student1._id,
        title: 'Best practices for Mongoose schema indexing in high-traffic applications?',
        content: 'Should we create compound indexes on studentId and courseId for progress queries?',
        isPinned: true,
        tags: ['Mongoose', 'Database', 'Optimization'],
        replies: [
          {
            author: instructor._id,
            authorName: instructor.name,
            authorAvatar: instructor.avatar,
            content: 'Yes! Compound indexing on { studentId: 1, courseId: 1 } ensures O(1) query lookups for progress tracking.',
            isInstructor: true,
          },
        ],
      },
    ]);

    console.log('Created Discussions.');

    // 7. Create Notifications
    await Notification.create([
      {
        recipient: instructor._id,
        title: 'New Quiz Submission Pending Review',
        message: 'Student Sophia Martinez completed "Microservices Communication Protocols" and requires manual short-answer review.',
        type: 'assessment',
        isRead: false,
        link: '/instructor/quiz-results',
      },
      {
        recipient: instructor._id,
        title: 'New Student Course Enrollment',
        message: 'Alexander Wright enrolled in "Advanced Full-Stack Engineering with Node.js & React".',
        type: 'enrollment',
        isRead: true,
        link: '/instructor/students',
      },
    ]);

    console.log('Created Notifications.');

    // 8. Create Certificates
    await CertificateModel.create({
      verificationCode: 'EZT-CERT-880CEA-3ZTX',
      studentId: student1._id,
      courseId: course1._id,
      issuedAt: new Date(),
      certificateUrl: '/uploads/certificates/certificate_EZT-CERT-880CEA-3ZTX.pdf',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA',
    });

    console.log('Created Certificates.');
    console.log('=== SEEDING COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
}
>>>>>>> feature/instructor-dashboard

seedDatabase();
