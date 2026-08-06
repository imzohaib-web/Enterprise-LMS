'use strict';
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

seedDatabase();
