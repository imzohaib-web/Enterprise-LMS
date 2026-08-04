'use strict';
require('dotenv').config();
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
      console.log('✅ Created Instructor: instructor@enterprise.lms / InstructorPassword123!');
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
      console.log('✅ Created Admin: admin@enterprise.lms / AdminPassword123!');
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
        isActive: true,
      });
      console.log('✅ Created Student: student@enterprise.lms / StudentPassword123!');
    }

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

      await Course.insertMany(coursesToInsert);
      console.log('✅ Created 3 Published Courses in MongoDB!');
    }

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
