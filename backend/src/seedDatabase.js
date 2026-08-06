'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Discussion = require('./models/Discussion');
const Notification = require('./models/Notification');
const LearningPath = require('./models/LearningPath');
const { QuizModel, QuizAttemptModel } = require('./modules/assessments/assessment.model');
const CertificateModel = require('./modules/certificates/certificate.model');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

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

    // 1. Create Instructor Users
    const instructor = await User.create({
      _id: new mongoose.Types.ObjectId('661000000000000000000001'),
      firstName: 'Dr. Sarah',
      lastName: 'Jenkins',
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

    await User.create({
      firstName: 'Dr. Elena',
      lastName: 'Rostova',
      email: 'instructor@enterprise.lms',
      password: 'InstructorPassword123!',
      role: 'instructor',
      isActive: true,
    });

    // 2. Create Admin Users
    await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@enterprise.lms',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true,
    });

    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lms.com',
      password: 'password123',
      role: 'admin',
      isActive: true,
    });

    // 3. Create Students
    const student1 = await User.create({
      _id: new mongoose.Types.ObjectId('661000000000000000000002'),
      firstName: 'Alexander',
      lastName: 'Wright',
      email: 'alex.wright@student.com',
      password: 'password123',
      role: 'student',
      avatar: '/images/user/user-01.jpg',
    });

    const student2 = await User.create({
      _id: new mongoose.Types.ObjectId('661000000000000000000003'),
      firstName: 'Sophia',
      lastName: 'Martinez',
      email: 'sophia.m@student.com',
      password: 'password123',
      role: 'student',
      avatar: '/images/user/user-02.jpg',
    });

    const student3 = await User.create({
      _id: new mongoose.Types.ObjectId('661000000000000000000004'),
      firstName: 'David',
      lastName: 'Chen',
      email: 'david.chen@student.com',
      password: 'password123',
      role: 'student',
      avatar: '/images/user/user-03.jpg',
    });

    await User.create({
      firstName: 'Student',
      lastName: 'User',
      email: 'student@lms.com',
      password: 'password123',
      role: 'student',
      isActive: true,
    });

    await User.create({
      firstName: 'Alex',
      lastName: 'Student',
      email: 'student@enterprise.lms',
      password: 'StudentPassword123!',
      role: 'student',
      isActive: true,
    });

    console.log('Created Users (Instructor, Admin & Students).');

    // 4. Create Courses
    const course1 = await Course.create({
      title: 'Advanced Full-Stack Engineering with Node.js & React',
      description: 'Master enterprise web application architecture using Node.js, Express, MongoDB, and React with TypeScript.',
      category: 'Software Engineering',
      status: 'published',
      instructor: instructor._id,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
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
            { title: 'Node.js Event Loop Deep Dive', duration: 1200, type: 'video', isPreview: true },
            { title: 'Express Routing & Middleware Design', duration: 2100, type: 'video' },
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

    console.log('Created Courses.');

    // 5. Create Enrollments
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
    ]);

    console.log('Created Enrollments.');

    // 6. Create Quizzes & Attempts
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
          ],
          correctAnswer: 'libuv library',
          marks: 50,
        },
      ],
    });

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
        correctAnswersCount: 1,
        wrongAnswersCount: 0,
        timeTakenSeconds: 840,
        answers: [{ questionId: '1', selectedOption: 'libuv library', isCorrect: true, marksAwarded: 50 }],
      },
    ]);

    console.log('Created Quizzes & Attempts.');

    // 7. Create Discussions & Notifications
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
            authorName: 'Dr. Sarah Jenkins',
            authorAvatar: instructor.avatar,
            content: 'Yes! Compound indexing on { studentId: 1, courseId: 1 } ensures O(1) query lookups for progress tracking.',
            isInstructor: true,
          },
        ],
      },
    ]);

    await Notification.create([
      {
        recipient: instructor._id,
        title: 'New Quiz Submission Pending Review',
        message: 'Student Sophia Martinez completed "Microservices Communication Protocols" and requires manual short-answer review.',
        type: 'assessment',
        isRead: false,
        link: '/instructor/quiz-results',
      },
    ]);

    console.log('Created Discussions & Notifications.');
    console.log('=== SEEDING COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
