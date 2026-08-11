'use strict';

const Assignment = require('../../models/Assignment');
const AssignmentSubmission = require('../../models/AssignmentSubmission');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const Discussion = require('../../models/Discussion');
const Notification = require('../../models/Notification');
const LearningPath = require('../../models/LearningPath');
const { QuizModel, QuizAttemptModel } = require('../assessments/assessment.model');
const CertificateModel = require('../certificates/certificate.model');
const { StudentProgressModel } = require('../progress/progress.model');
const AppError = require('../../utils/appError');
const CourseService = require('../courses/course.service');

class InstructorService {
  /**
   * Calculate instructor dashboard statistics using MongoDB aggregations.
   */
  static async getDashboardStats(instructorId) {
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);

    // 1. Courses stats
    const courses = await Course.find({ instructor: instructorObjectId }).lean();
    const assignedCoursesCount = courses.length;
    const publishedCoursesCount = courses.filter((c) => c.status === 'published').length;
    const draftCoursesCount = courses.filter((c) => c.status === 'draft').length;
    const courseIds = courses.map((c) => c._id);

    // 2. Distinct Enrolled Students count & Active Enrollments
    const enrollments = await Enrollment.find({ instructor: instructorObjectId }).lean();
    const activeEnrollmentsCount = enrollments.length;
    const distinctStudentIds = new Set(enrollments.map((e) => e.student.toString()));
    const totalStudentsCount = distinctStudentIds.size;

    // 3. Assessments & Pending Reviews
    const quizzes = await QuizModel.find({
      $or: [{ instructorId: instructorObjectId }, { courseId: { $in: courseIds } }],
    }).lean();
    const upcomingAssessmentsCount = quizzes.filter((q) => q.status === 'published' || q.status === 'scheduled').length;

    const pendingReviewsCount = await QuizAttemptModel.countDocuments({
      $or: [{ instructorId: instructorObjectId }, { courseId: { $in: courseIds } }],
      status: 'pending_review',
    });

    // 4. Certificates Issued
    const certificatesCount = await CertificateModel.countDocuments({
      courseId: { $in: courseIds },
    });

    // 5. Learning Paths created by instructor
    const learningPathsCount = await LearningPath.countDocuments({
      createdBy: instructorObjectId,
    });

    // 6. Recent Discussions count
    const recentDiscussionsCount = await Discussion.countDocuments({
      $or: [{ instructor: instructorObjectId }, { course: { $in: courseIds } }],
    });

    // 7. Unread Notifications count
    const unreadNotificationsCount = await Notification.countDocuments({
      recipient: instructorObjectId,
      isRead: false,
    });

    // 8. Recent Activities (combining quiz attempts and enrollments)
    const recentAttempts = await QuizAttemptModel.find({
      $or: [{ instructorId: instructorObjectId }, { courseId: { $in: courseIds } }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('studentId', 'name avatar')
      .populate('quizId', 'title')
      .lean();

    const recentEnrollments = await Enrollment.find({ instructor: instructorObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('student', 'name avatar')
      .populate('course', 'title')
      .lean();

    const activities = [];

    recentAttempts.forEach((att) => {
      activities.push({
        id: att._id.toString(),
        type: 'quiz_attempt',
        studentName: att.studentId?.name || 'Student',
        studentAvatar: att.studentId?.avatar || '',
        targetTitle: att.quizId?.title || 'Quiz Assessment',
        scoreOrProgress: `${att.percentage || 0}%`,
        status: att.passed ? 'passed' : 'failed',
        timestamp: att.createdAt ? new Date(att.createdAt).toISOString() : new Date().toISOString(),
      });
    });

    recentEnrollments.forEach((enr) => {
      activities.push({
        id: enr._id.toString(),
        type: 'enrollment',
        studentName: enr.student?.name || 'Student',
        studentAvatar: enr.student?.avatar || '',
        targetTitle: enr.course?.title || 'Course Enrollment',
        scoreOrProgress: `${enr.progressPercentage || 0}%`,
        status: 'enrolled',
        timestamp: enr.createdAt ? new Date(enr.createdAt).toISOString() : new Date().toISOString(),
      });
    });

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 8. Real Month-over-Month (MoM) Growth Rates
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const currentMonthCourses = await Course.countDocuments({ instructor: instructorObjectId, createdAt: { $gte: startOfCurrentMonth } });
    const prevMonthCourses = await Course.countDocuments({ instructor: instructorObjectId, createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth } });
    const coursesGrowth = prevMonthCourses > 0
      ? Math.round(((currentMonthCourses - prevMonthCourses) / prevMonthCourses) * 100 * 10) / 10
      : currentMonthCourses > 0 ? 100 : 0;

    const currentMonthStudents = await Enrollment.countDocuments({ instructor: instructorObjectId, createdAt: { $gte: startOfCurrentMonth } });
    const prevMonthStudents = await Enrollment.countDocuments({ instructor: instructorObjectId, createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth } });
    const studentsGrowth = prevMonthStudents > 0
      ? Math.round(((currentMonthStudents - prevMonthStudents) / prevMonthStudents) * 100 * 10) / 10
      : currentMonthStudents > 0 ? 100 : 0;

    const currentMonthPub = await Course.countDocuments({ instructor: instructorObjectId, status: 'published', createdAt: { $gte: startOfCurrentMonth } });
    const prevMonthPub = await Course.countDocuments({ instructor: instructorObjectId, status: 'published', createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth } });
    const publishedGrowth = prevMonthPub > 0
      ? Math.round(((currentMonthPub - prevMonthPub) / prevMonthPub) * 100 * 10) / 10
      : currentMonthPub > 0 ? 100 : 0;

    const currentMonthPending = await QuizAttemptModel.countDocuments({ $or: [{ instructorId: instructorObjectId }, { courseId: { $in: courseIds } }], status: 'pending_review', createdAt: { $gte: startOfCurrentMonth } });
    const prevMonthPending = await QuizAttemptModel.countDocuments({ $or: [{ instructorId: instructorObjectId }, { courseId: { $in: courseIds } }], status: 'pending_review', createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth } });
    const pendingGrowth = prevMonthPending > 0
      ? Math.round(((currentMonthPending - prevMonthPending) / prevMonthPending) * 100 * 10) / 10
      : currentMonthPending > 0 ? 100 : 0;

    return {
      totalCourses: assignedCoursesCount,
      assignedCourses: assignedCoursesCount,
      publishedCourses: publishedCoursesCount,
      draftCourses: draftCoursesCount,
      totalStudents: totalStudentsCount,
      activeEnrollments: activeEnrollmentsCount,
      upcomingAssessments: upcomingAssessmentsCount,
      pendingAssessments: pendingReviewsCount,
      pendingQuizReviews: pendingReviewsCount,
      certificatesIssued: certificatesCount,
      learningPaths: learningPathsCount,
      recentDiscussions: recentDiscussionsCount,
      notifications: unreadNotificationsCount,
      coursesGrowth,
      studentsGrowth,
      publishedGrowth,
      pendingGrowth,
      recentActivity: activities.slice(0, 8),
    };
  }

  /**
   * Get list of courses assigned to logged in instructor.
   */
  static async getInstructorCourses(instructorId, queryParams = {}) {
    const { search, status, category, page = 1, limit = 20 } = queryParams;
    const filter = { instructor: new mongoose.Types.ObjectId(instructorId) };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const courseIds = courses.map((c) => c._id);
    const quizzes = await QuizModel.find({ courseId: { $in: courseIds } }, 'courseId').lean();
    const quizCountMap = new Map();
    quizzes.forEach((q) => {
      if (q.courseId) {
        const cid = q.courseId.toString();
        quizCountMap.set(cid, (quizCountMap.get(cid) || 0) + 1);
      }
    });

    const formatted = courses.map((c) => {
      const lessonsCount = c.sections ? c.sections.reduce((acc, s) => acc + (s.lessons ? s.lessons.length : 0), 0) : 0;
      const cidStr = c._id.toString();
      return {
        id: cidStr,
        _id: cidStr,
        title: c.title,
        category: typeof c.category === 'object' && c.category ? c.category.name : c.category || 'General',
        status: c.status || 'draft',
        enrolledStudents: c.enrolledStudentsCount || 0,
        enrolledStudentsCount: c.enrolledStudentsCount || 0,
        totalModules: lessonsCount,
        lessonsCount: lessonsCount,
        assessmentsCount: quizCountMap.get(cidStr) || 0,
        sections: c.sections || [],
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        coverImage: c.coverImage || '',
        price: c.price || 0,
        rating: c.rating || 4.8,
        difficulty: c.difficulty || 'intermediate',
        duration: c.duration || '10 hours',
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
      };
    });

    return { courses: formatted, total, page: Number(page), limit: Number(limit) };
  }

  /**
   * Create a new course assigned to instructor via CourseService.
   */
  static async createCourse(instructorId, courseData) {
    const course = await CourseService.createCourse(courseData, instructorId);
    return course;
  }

  /**
   * Get single course details with instructor authorization via CourseService.
   */
  static async getCourseById(instructorId, courseId) {
    const course = await CourseService.getCourseById(courseId, true);
    const instIdStr = course.instructor?._id ? course.instructor._id.toString() : course.instructor ? course.instructor.toString() : '';
    if (instIdStr && instIdStr !== instructorId.toString()) {
      throw AppError.forbidden('Course not found or unauthorized');
    }
    const plainCourse = typeof course.toObject === 'function' ? course.toObject() : course;
    return {
      ...plainCourse,
      id: plainCourse._id.toString(),
    };
  }

  /**
   * Update course details via CourseService (includes ownership check & cache invalidation).
   */
  static async updateCourse(instructorId, courseId, updateData) {
    const user = { _id: instructorId, role: 'instructor' };
    const course = await CourseService.updateCourse(courseId, updateData, user);
    return course;
  }

  /**
   * Delete course via CourseService (includes media cleanup, enrollment cleanup & cache invalidation).
   */
  static async deleteCourse(instructorId, courseId) {
    const user = { _id: instructorId, role: 'instructor' };
    await CourseService.deleteCourse(courseId, user);
    return true;
  }

  /**
   * Toggle publish / draft status via CourseService.
   */
  static async togglePublishCourse(instructorId, courseId, status) {
    const user = { _id: instructorId, role: 'instructor' };
    const course = await CourseService.updateCourse(courseId, { status }, user);
    return course;
  }

  /**
   * Assessment management: get assessments for instructor courses.
   */
  static async getInstructorAssessments(instructorId) {
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const courses = await Course.find({ instructor: instructorObjectId }, '_id title').lean();
    const courseIds = courses.map((c) => c._id);
    const courseMap = new Map(courses.map((c) => [c._id.toString(), c.title]));

    const assessments = await QuizModel.find({
      $or: [{ instructorId: instructorObjectId }, { courseId: { $in: courseIds } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const quizIds = assessments.map((q) => q._id);
    const attemptStats = await QuizAttemptModel.aggregate([
      { $match: { quizId: { $in: quizIds } } },
      {
        $group: {
          _id: '$quizId',
          totalAttempts: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' },
        },
      },
    ]);

    const statsMap = new Map();
    attemptStats.forEach((s) => {
      if (s._id) {
        statsMap.set(s._id.toString(), {
          attempts: s.totalAttempts || 0,
          avgScore: Math.round(s.avgPercentage || 0),
        });
      }
    });

    return assessments.map((q) => {
      const qidStr = q._id.toString();
      const st = statsMap.get(qidStr) || { attempts: 0, avgScore: 0 };
      return {
        id: qidStr,
        _id: qidStr,
        title: q.title,
        description: q.description || '',
        courseId: q.courseId ? q.courseId.toString() : '',
        courseName: q.courseId ? courseMap.get(q.courseId.toString()) || 'Assigned Course' : 'General',
        type: q.type || 'quiz',
        status: q.status || 'published',
        timeLimitMinutes: q.timeLimitMinutes || 30,
        duration: q.timeLimitMinutes || 30,
        passingScore: q.passingScore || 70,
        totalMarks: q.totalMarks || 100,
        questionsCount: q.questions ? q.questions.length : 0,
        questions: q.questions || [],
        attemptsAllowed: q.attemptsAllowed || 3,
        shuffleQuestions: q.shuffleQuestions || false,
        negativeMarking: q.negativeMarking || false,
        dueDate: q.dueDate ? new Date(q.dueDate).toISOString().split('T')[0] : null,
        scheduledFor: q.scheduledFor ? new Date(q.scheduledFor).toISOString() : null,
        studentAttempts: st.attempts,
        averageScore: st.avgScore,
        createdAt: q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
      };
    });
  }

  /**
   * Create assessment for instructor.
   */
  static async createAssessment(instructorId, assessmentData) {
    const assessment = await QuizModel.create({
      ...assessmentData,
      instructorId: new mongoose.Types.ObjectId(instructorId),
    });
    return assessment;
  }

  /**
   * Update assessment with ownership check.
   */
  static async updateAssessment(instructorId, userRole, assessmentId, updateData) {
    const assessment = await QuizModel.findById(assessmentId);
    if (!assessment) {
      throw AppError.notFound('Assessment');
    }

    if (userRole !== 'admin') {
      const isDirectOwner = assessment.instructorId && assessment.instructorId.toString() === instructorId.toString();
      let isCourseOwner = false;
      if (!isDirectOwner && assessment.courseId) {
        isCourseOwner = Boolean(await Course.exists({ _id: assessment.courseId, instructor: new mongoose.Types.ObjectId(instructorId) }));
      }
      if (!isDirectOwner && !isCourseOwner) {
        throw AppError.forbidden('You do not have permission to modify this assessment');
      }
    }

    Object.assign(assessment, updateData);
    await assessment.save();
    return assessment;
  }

  /**
   * Delete assessment with ownership check.
   */
  static async deleteAssessment(instructorId, userRole, assessmentId) {
    const assessment = await QuizModel.findById(assessmentId);
    if (!assessment) {
      throw AppError.notFound('Assessment');
    }

    if (userRole !== 'admin') {
      const isDirectOwner = assessment.instructorId && assessment.instructorId.toString() === instructorId.toString();
      let isCourseOwner = false;
      if (!isDirectOwner && assessment.courseId) {
        isCourseOwner = Boolean(await Course.exists({ _id: assessment.courseId, instructor: new mongoose.Types.ObjectId(instructorId) }));
      }
      if (!isDirectOwner && !isCourseOwner) {
        throw AppError.forbidden('You do not have permission to delete this assessment');
      }
    }

    await QuizModel.findByIdAndDelete(assessmentId);
    return true;
  }

  /**
   * Quiz attempts & results for instructor's courses.
   */
  static async getQuizResults(instructorId) {
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const courses = await Course.find({ instructor: instructorObjectId }, '_id title').lean();
    const courseIds = courses.map((c) => c._id);

    const attempts = await QuizAttemptModel.find({
      $or: [{ instructorId: instructorObjectId }, { courseId: { $in: courseIds } }],
    })
      .sort({ createdAt: -1 })
      .populate('studentId', 'name email avatar')
      .populate('quizId', 'title description questions passingScore totalMarks timeLimitMinutes')
      .populate('courseId', 'title')
      .lean();

    return attempts.map((a) => {
      const questionsList = a.quizId?.questions || [];
      const questionsMap = new Map();
      questionsList.forEach((q) => {
        if (q._id) questionsMap.set(q._id.toString(), q);
      });

      const detailedAnswers = (a.answers || []).map((ans, idx) => {
        const qDetail = questionsMap.get(ans.questionId?.toString()) || questionsList[idx] || {};
        return {
          questionId: ans.questionId || qDetail._id?.toString() || `q-${idx + 1}`,
          questionText: qDetail.question || `Question ${idx + 1}`,
          type: qDetail.type || 'mcq',
          options: qDetail.options || [],
          correctAnswer: qDetail.correctAnswer || '',
          marks: qDetail.marks || 1,
          explanation: qDetail.explanation || '',
          selectedOption: ans.selectedOption || '',
          textAnswer: ans.textAnswer || '',
          codeAnswer: ans.codeAnswer || '',
          submittedAnswer: ans.selectedOption || ans.textAnswer || ans.codeAnswer || '',
          isCorrect: ans.isCorrect ?? false,
          marksAwarded: ans.marksAwarded ?? 0,
          feedback: ans.feedback || '',
        };
      });

      return {
        id: a._id.toString(),
        _id: a._id.toString(),
        quizTitle: a.quizId?.title || 'Quiz Assessment',
        courseName: a.courseId?.title || 'Course',
        studentName: a.studentId?.name || 'Student Name',
        studentEmail: a.studentId?.email || '',
        studentAvatar: a.studentId?.avatar || '',
        score: a.percentage || a.score || 0,
        totalQuestions: detailedAnswers.length,
        passed: a.passed,
        status: a.status || 'submitted',
        feedback: a.feedback || '',
        attemptDate: a.createdAt ? new Date(a.createdAt).toISOString().replace('T', ' ').slice(0, 16) : '',
        answers: detailedAnswers,
      };
    });
  }

  /**
   * Submit manual review for open ended quiz questions with ownership check.
   */
  static async reviewQuizAttempt(instructorId, userRole, attemptId, reviewData) {
    const { score, status = 'reviewed', feedback } = reviewData;
    const attempt = await QuizAttemptModel.findById(attemptId);
    if (!attempt) {
      throw AppError.notFound('Quiz attempt');
    }

    if (userRole !== 'admin') {
      const isDirectOwner = attempt.instructorId && attempt.instructorId.toString() === instructorId.toString();
      let isCourseOwner = false;
      if (!isDirectOwner && attempt.courseId) {
        isCourseOwner = Boolean(await Course.exists({ _id: attempt.courseId, instructor: new mongoose.Types.ObjectId(instructorId) }));
      }
      if (!isDirectOwner && !isCourseOwner) {
        throw AppError.forbidden('You do not have permission to review this quiz attempt');
      }
    }

    if (score !== undefined) {
      attempt.score = score;
      attempt.percentage = Math.round((score / (attempt.totalMarks || 100)) * 100);
      attempt.passed = attempt.percentage >= 70;
    }
    attempt.status = status;
    if (feedback !== undefined) {
      attempt.feedback = feedback;
    }
    await attempt.save();
    return attempt;
  }

  /**
   * Get enrolled students progress across instructor's courses with real quiz scores.
   */
  static async getStudentProgressList(instructorId) {
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const enrollments = await Enrollment.find({ instructor: instructorObjectId })
      .populate('student', 'name email avatar')
      .populate('course', 'title sections')
      .sort({ updatedAt: -1 })
      .lean();

    const result = await Promise.all(
      enrollments.map(async (e) => {
        const totalMods = e.totalModules || (e.course?.sections ? e.course.sections.length : 8);
        let avgQuizScore = 0;
        if (e.student?._id && e.course?._id) {
          const attempts = await QuizAttemptModel.find({ studentId: e.student._id, courseId: e.course._id }).lean();
          if (attempts.length > 0) {
            const sum = attempts.reduce((acc, a) => acc + (a.percentage || a.score || 0), 0);
            avgQuizScore = Math.round(sum / attempts.length);
          }
        }

        return {
          id: e._id.toString(),
          studentId: e.student?._id?.toString() || '',
          studentName: e.student?.name || 'Enrolled Student',
          studentEmail: e.student?.email || '',
          avatar: e.student?.avatar || '',
          courseName: e.course?.title || 'Assigned Course',
          progressPercent: e.progressPercentage || 0,
          completedModules: e.completedModules || 0,
          totalModules: totalMods,
          avgScore: avgQuizScore,
          lastActive: e.lastActive ? new Date(e.lastActive).toISOString() : e.updatedAt ? new Date(e.updatedAt).toISOString() : new Date().toISOString(),
        };
      })
    );

    return result;
  }

  /**
   * Complete Instructor Analytics with Authentic MongoDB Aggregations.
   */
  static async getInstructorAnalytics(instructorId) {
    const instructorObjId = new mongoose.Types.ObjectId(instructorId);

    // 1. Instructor Courses
    const courses = await Course.find({ instructor: instructorObjId }).lean();
    const courseIds = courses.map((c) => c._id);
    const activeCourses = courses.filter((c) => c.status === 'published').length;

    const courseCategoryMap = new Map();
    courses.forEach((c) => {
      const catName = typeof c.category === 'object' && c.category ? c.category.name : c.category || 'General';
      courseCategoryMap.set(c._id.toString(), catName);
    });

    // 2. Total Students & Enrollments & Course Completion Rate
    const enrollments = await Enrollment.find({ instructor: instructorObjId }).lean();
    const totalStudents = new Set(enrollments.map((e) => (e.student ? e.student.toString() : ''))).size;
    const completedEnrollments = enrollments.filter((e) => e.status === 'completed' || (e.progressPercentage && e.progressPercentage >= 100)).length;
    const courseCompletionRate = enrollments.length > 0
      ? Math.round((completedEnrollments / enrollments.length) * 100)
      : 0;

    // 3. Quiz Attempts & Average Score
    const attempts = await QuizAttemptModel.find({
      $or: [{ instructorId: instructorObjId }, { courseId: { $in: courseIds } }],
    }).lean();
    const assessmentAttempts = attempts.length;
    const avgScoreSum = attempts.reduce((acc, a) => acc + (a.percentage || a.score || 0), 0);
    const averageQuizScore = assessmentAttempts > 0 ? Math.round(avgScoreSum / assessmentAttempts) : 0;

    // 4. Student Progress average
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progressPercentage || 0), 0) / enrollments.length)
      : 0;

    // 5. Learning Path Completion
    const learningPaths = await LearningPath.find({
      $or: [{ createdBy: instructorObjId }, { assignedInstructors: instructorObjId }],
    }).lean();
    const totalLpEnrollments = learningPaths.reduce((acc, lp) => acc + (lp.enrollmentCount || 0), 0);
    const totalLpCompleted = learningPaths.reduce((acc, lp) => acc + (lp.completedCount || 0), 0);
    const lpCompletionRate = totalLpEnrollments > 0 ? Math.round((totalLpCompleted / totalLpEnrollments) * 100) : 0;

    // 6. Discussion Activity
    const discussionsCount = await Discussion.countDocuments({
      $or: [{ instructor: instructorObjId }, { course: { $in: courseIds } }],
    });

    // 7. Monthly Enrollments & Completion Trend Aggregation (last 6 months, real counts)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyEnrollments = [];
    const completionTrend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLabel = months[d.getMonth()];

      const monthEnrollments = enrollments.filter(
        (e) => e.createdAt && new Date(e.createdAt) >= startOfMonth && new Date(e.createdAt) <= endOfMonth
      );
      const monthCompleted = monthEnrollments.filter((e) => e.status === 'completed' || (e.progressPercentage && e.progressPercentage >= 100)).length;
      const monthInProgress = monthEnrollments.length - monthCompleted;

      monthlyEnrollments.push({
        month: monthLabel,
        count: monthEnrollments.length,
      });

      completionTrend.push({
        month: monthLabel,
        completed: monthCompleted,
        inProgress: monthInProgress,
      });
    }

    // 8. Quiz Performance by Category (Real MongoDB aggregation)
    const categoryQuizStats = new Map();
    attempts.forEach((att) => {
      const cid = att.courseId ? att.courseId.toString() : '';
      const catName = courseCategoryMap.get(cid) || 'General';
      if (!categoryQuizStats.has(catName)) {
        categoryQuizStats.set(catName, { totalScore: 0, count: 0, passedCount: 0 });
      }
      const stat = categoryQuizStats.get(catName);
      stat.totalScore += att.percentage || att.score || 0;
      stat.count += 1;
      if (att.passed) stat.passedCount += 1;
    });

    const quizPerformance = [];
    categoryQuizStats.forEach((stat, category) => {
      quizPerformance.push({
        category,
        averageScore: stat.count > 0 ? Math.round(stat.totalScore / stat.count) : 0,
        passRate: stat.count > 0 ? Math.round((stat.passedCount / stat.count) * 100) : 0,
      });
    });

    // 9. Day of Week Student Activity Pipeline (Real aggregation over enrollments and attempts)
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];

    enrollments.forEach((e) => {
      if (e.updatedAt || e.createdAt) {
        const dayIdx = new Date(e.updatedAt || e.createdAt).getDay();
        dayCounts[dayIdx] += 1;
      }
    });

    attempts.forEach((att) => {
      if (att.createdAt) {
        const dayIdx = new Date(att.createdAt).getDay();
        dayCounts[dayIdx] += 1;
      }
    });

    const studentActivity = [1, 2, 3, 4, 5, 6, 0].map((dayIdx) => ({
      day: dayLabels[dayIdx],
      active: dayCounts[dayIdx],
    }));

    return {
      metrics: {
        totalStudents,
        activeCourses,
        courseCompletionRate,
        averageQuizScore,
        assessmentAttempts,
        studentProgress: avgProgress,
        learningPathCompletion: lpCompletionRate,
        discussionActivity: discussionsCount,
      },
      charts: {
        monthlyEnrollments,
        quizPerformance,
        completionTrend,
        studentActivity,
      },
    };
  }

  /**
   * Get enrollment trends by month (Real MongoDB aggregation).
   */
  static async getEnrollmentTrends(instructorId) {
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const count = await Enrollment.countDocuments({
        instructor: instructorObjectId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      result.push({
        month: months[d.getMonth()],
        enrollments: count,
      });
    }

    return result;
  }

  /**
   * Get quiz performance trends by course category (Real MongoDB aggregation).
   */
  static async getQuizPerformanceTrends(instructorId) {
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const courses = await Course.find({ instructor: instructorObjectId }).lean();
    if (courses.length === 0) return [];

    const courseMap = new Map();
    courses.forEach((c) => {
      const catName = typeof c.category === 'object' && c.category ? c.category.name : c.category || 'General';
      courseMap.set(c._id.toString(), catName);
    });

    const courseIds = courses.map((c) => c._id);
    const attempts = await QuizAttemptModel.find({
      $or: [{ instructorId: instructorObjectId }, { courseId: { $in: courseIds } }],
    }).lean();

    const categoryStats = new Map();
    attempts.forEach((att) => {
      const cid = att.courseId ? att.courseId.toString() : '';
      const catName = courseMap.get(cid) || 'General';

      if (!categoryStats.has(catName)) {
        categoryStats.set(catName, { totalScore: 0, count: 0, passedCount: 0 });
      }
      const stat = categoryStats.get(catName);
      stat.totalScore += att.percentage || att.score || 0;
      stat.count += 1;
      if (att.passed) stat.passedCount += 1;
    });

    const result = [];
    categoryStats.forEach((stat, category) => {
      result.push({
        category,
        averageScore: stat.count > 0 ? Math.round(stat.totalScore / stat.count) : 0,
        passRate: stat.count > 0 ? Math.round((stat.passedCount / stat.count) * 100) : 0,
      });
    });

    if (result.length === 0) {
      const uniqueCats = Array.from(new Set(courses.map((c) => (typeof c.category === 'object' && c.category ? c.category.name : c.category || 'General'))));
      return uniqueCats.map((cat) => ({
        category: cat,
        averageScore: 0,
        passRate: 0,
      }));
    }

    return result;
  }

  /**
   * Get discussions for instructor's courses.
   */
  static async getInstructorDiscussions(instructorId) {
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const courses = await Course.find({ instructor: instructorObjectId }, '_id title').lean();
    const courseIds = courses.map((c) => c._id);
    const courseMap = new Map(courses.map((c) => [c._id.toString(), c.title]));

    const discussions = await Discussion.find({
      $or: [
        { instructor: instructorObjectId },
        { authorId: instructorObjectId },
        { author: instructorObjectId },
        { course: { $in: courseIds } },
        { courseId: { $in: courseIds } },
      ],
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('author', 'name avatar role')
      .populate('course', 'title')
      .lean();

    return discussions.map((d) => {
      const dId = d._id.toString();
      const authorIdStr = d.authorId ? d.authorId.toString() : d.author?._id ? d.author._id.toString() : '';
      const cName = d.courseName || d.course?.title || (d.courseId ? courseMap.get(d.courseId.toString()) : null) || 'General Discussion';
      const likesArr = d.likes ? d.likes.map((l) => l.toString()) : [];
      const isLikedByMe = likesArr.includes(instructorId.toString());

      return {
        id: dId,
        _id: dId,
        title: d.title,
        content: d.content,
        courseId: d.courseId ? d.courseId.toString() : d.course?._id ? d.course._id.toString() : '',
        courseName: cName,
        authorId: authorIdStr,
        authorName: d.authorName || d.author?.name || 'Discussion User',
        authorAvatar: d.authorAvatar || d.author?.avatar || '/images/user/owner.jpg',
        isPinned: Boolean(d.isPinned),
        isLocked: Boolean(d.isLocked),
        likesCount: d.likesCount || likesArr.length,
        isLikedByMe,
        tags: d.tags || [],
        repliesCount: d.replies ? d.replies.length : d.repliesCount || 0,
        replies: d.replies || [],
        createdAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now',
      };
    });
  }

  /**
   * Create a new discussion thread.
   */
  static async createDiscussion(instructorId, discussionData) {
    const instructor = await User.findById(instructorId).lean();
    let courseName = 'General Discussion';

    if (discussionData.courseId) {
      const course = await Course.findById(discussionData.courseId).lean();
      if (course) courseName = course.title;
    }

    const newDiscussion = await Discussion.create({
      title: discussionData.title,
      content: discussionData.content,
      courseId: discussionData.courseId || undefined,
      course: discussionData.courseId || undefined,
      instructor: new mongoose.Types.ObjectId(instructorId),
      authorId: new mongoose.Types.ObjectId(instructorId),
      author: new mongoose.Types.ObjectId(instructorId),
      authorName: instructor?.name || 'Instructor',
      authorAvatar: instructor?.avatar || '/images/user/owner.jpg',
      courseName,
      tags: discussionData.tags || [],
      isPinned: Boolean(discussionData.isPinned),
      isLocked: Boolean(discussionData.isLocked),
    });

    try {
      const { emitDashboardRefresh } = require('../../sockets/socket');
      emitDashboardRefresh();
    } catch {
      /* ignore socket errors */
    }

    return newDiscussion;
  }

  /**
   * Reply to a discussion topic and trigger notifications.
   */
  static async replyDiscussion(instructorId, discussionId, replyContent) {
    const instructor = await User.findById(instructorId).lean();
    const reply = {
      _id: new mongoose.Types.ObjectId(),
      author: new mongoose.Types.ObjectId(instructorId),
      authorId: new mongoose.Types.ObjectId(instructorId),
      authorName: instructor?.name || 'Instructor',
      authorAvatar: instructor?.avatar || '/images/user/owner.jpg',
      content: replyContent,
      isInstructor: true,
      createdAt: new Date(),
    };

    const discussion = await Discussion.findByIdAndUpdate(
      discussionId,
      {
        $push: { replies: reply },
        $inc: { repliesCount: 1 },
      },
      { new: true }
    );

    if (discussion && discussion.authorId && discussion.authorId.toString() !== instructorId.toString()) {
      try {
        const notificationService = require('../notifications/notification.service');
        await notificationService.createAndEmitNotification({
          userId: discussion.authorId,
          title: 'New Reply from Instructor 💬',
          message: `Instructor ${instructor?.name || ''} replied to your topic "${discussion.title}".`,
          type: 'info',
          category: 'discussion',
          actionUrl: `/discussions`,
        });
      } catch (err) {
        console.warn('Failed to send discussion reply notification:', err.message);
      }
    }

    try {
      const { emitDashboardRefresh } = require('../../sockets/socket');
      emitDashboardRefresh();
    } catch {
      /* ignore socket errors */
    }

    return discussion;
  }

  /**
   * Update discussion content/title/tags with ownership check.
   */
  static async updateDiscussion(instructorId, userRole, discussionId, updateData) {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      throw AppError.notFound('Discussion');
    }

    if (userRole !== 'admin') {
      const authorIdStr = discussion.authorId ? discussion.authorId.toString() : discussion.author ? discussion.author.toString() : '';
      const isAuthor = authorIdStr === instructorId.toString();
      let isCourseInstructor = false;
      if (!isAuthor && discussion.courseId) {
        isCourseInstructor = Boolean(await Course.exists({ _id: discussion.courseId, instructor: new mongoose.Types.ObjectId(instructorId) }));
      }
      if (!isAuthor && !isCourseInstructor) {
        throw AppError.forbidden('You do not have permission to update this discussion');
      }
    }

    Object.assign(discussion, updateData);
    await discussion.save();
    return discussion;
  }

  /**
   * Delete discussion thread with ownership check.
   */
  static async deleteDiscussion(instructorId, userRole, discussionId) {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      throw AppError.notFound('Discussion');
    }

    if (userRole !== 'admin') {
      const authorIdStr = discussion.authorId ? discussion.authorId.toString() : discussion.author ? discussion.author.toString() : '';
      const isAuthor = authorIdStr === instructorId.toString();
      let isCourseInstructor = false;
      if (!isAuthor && discussion.courseId) {
        isCourseInstructor = Boolean(await Course.exists({ _id: discussion.courseId, instructor: new mongoose.Types.ObjectId(instructorId) }));
      }
      if (!isAuthor && !isCourseInstructor) {
        throw AppError.forbidden('You do not have permission to delete this discussion');
      }
    }

    await Discussion.findByIdAndDelete(discussionId);
    try {
      const { emitDashboardRefresh } = require('../../sockets/socket');
      emitDashboardRefresh();
    } catch {
      /* ignore socket errors */
    }
    return true;
  }

  /**
   * Toggle pin, lock or like status with authorization checks.
   */
  static async updateDiscussionStatus(instructorId, userRole, discussionId, statusData) {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      throw AppError.notFound('Discussion');
    }

    if (statusData.toggleLike) {
      const instructorObjId = new mongoose.Types.ObjectId(instructorId);
      const likes = discussion.likes || [];
      const existsIndex = likes.findIndex((l) => l.toString() === instructorId.toString());

      if (existsIndex > -1) {
        likes.splice(existsIndex, 1);
      } else {
        likes.push(instructorObjId);
      }

      discussion.likes = likes;
      discussion.likesCount = likes.length;
    } else {
      if (userRole !== 'admin') {
        const authorIdStr = discussion.authorId ? discussion.authorId.toString() : discussion.author ? discussion.author.toString() : '';
        const isAuthor = authorIdStr === instructorId.toString();
        let isCourseInstructor = false;
        if (!isAuthor && discussion.courseId) {
          isCourseInstructor = Boolean(await Course.exists({ _id: discussion.courseId, instructor: new mongoose.Types.ObjectId(instructorId) }));
        }
        if (!isAuthor && !isCourseInstructor) {
          throw AppError.forbidden('You do not have permission to modify status for this discussion');
        }
      }

      if (statusData.isPinned !== undefined) discussion.isPinned = statusData.isPinned;
      if (statusData.isLocked !== undefined) discussion.isLocked = statusData.isLocked;
    }

    await discussion.save();

    try {
      const { emitDashboardRefresh } = require('../../sockets/socket');
      emitDashboardRefresh();
    } catch {
      /* ignore socket errors */
    }

    return discussion;
  }

  /**
   * Notifications for instructor.
   */
  static async getInstructorNotifications(instructorId) {
    const notifications = await Notification.find({
      recipient: new mongoose.Types.ObjectId(instructorId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      link: n.link || '',
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    }));
  }

  /**
   * Mark notification as read.
   */
  static async markNotificationRead(instructorId, notificationId) {
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: new mongoose.Types.ObjectId(instructorId) },
      { $set: { isRead: true } }
    );
    return true;
  }

  /**
   * Mark all notifications read.
   */
  static async markAllNotificationsRead(instructorId) {
    await Notification.updateMany(
      { recipient: new mongoose.Types.ObjectId(instructorId) },
      { $set: { isRead: true } }
    );
    return true;
  }

  /**
   * Instructor profile fetch and update.
   */
  static async getInstructorProfile(instructorId) {
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const user = await User.findById(instructorId).lean();
    if (!user) {
      throw new Error('Instructor profile not found');
    }

    const courses = await Course.find({ instructor: instructorObjectId }).lean();
    const courseIds = courses.map((c) => c._id);

    const totalCourses = courses.length;
    const enrollments = await Enrollment.find({ instructor: instructorObjectId }).lean();
    const totalStudents = new Set(enrollments.map((e) => (e.student ? e.student.toString() : ''))).size;

    const totalAssessments = await QuizModel.countDocuments({
      $or: [{ instructorId: instructorObjectId }, { courseId: { $in: courseIds } }],
    });

    const joinedDate = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';

    const ratings = courses.map((c) => c.rating || c.averageRating || 0).filter((r) => typeof r === 'number' && r > 0);
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((acc, r) => acc + r, 0) / ratings.length) * 10) / 10
      : 0;

    return {
      id: user._id.toString(),
      name: user.name || '',
      email: user.email || '',
      avatar: user.avatar || '',
      phone: user.phone || '',
      department: user.department || '',
      qualification: user.qualification || '',
      specialization: user.specialization || '',
      experience: user.experience || '',
      bio: user.bio || '',
      joinedDate,
      stats: {
        totalCourses,
        totalStudents,
        totalAssessments,
        avgRating,
      },
      socialLinks: user.socialLinks || { linkedin: '', github: '', twitter: '', website: '' },
      settings: user.settings || {},
    };
  }

  static async updateInstructorProfile(instructorId, profileData) {
    if (profileData.avatar && typeof profileData.avatar === 'string' && profileData.avatar.startsWith('data:image/')) {
      throw AppError.badRequest('Base64 image data is not allowed. Please upload avatar images via the avatar upload service.');
    }
    const user = await User.findByIdAndUpdate(
      instructorId,
      { $set: profileData },
      { new: true, runValidators: true }
    ).lean();
    return user;
  }

  static async updateInstructorSettings(instructorId, settingsData) {
    const user = await User.findById(instructorId);
    if (!user) throw new Error('User not found');

    if (settingsData.email) user.email = settingsData.email;
    if (settingsData.phone) user.phone = settingsData.phone;
    if (settingsData.name) user.name = settingsData.name;
    if (settingsData.department) user.department = settingsData.department;

    if (settingsData.password) {
      if (settingsData.currentPassword && typeof user.comparePassword === 'function') {
        const isMatch = await user.comparePassword(settingsData.currentPassword);
        if (!isMatch) {
          throw new Error('Current password is incorrect');
        }
      }
      user.password = settingsData.password;
    }

    if (settingsData.settings) {
      user.settings = { ...user.settings, ...settingsData.settings };
    }

    await user.save();

    return {
      email: user.email,
      phone: user.phone,
      name: user.name,
      department: user.department,
      settings: user.settings,
    };
  }

  // ── Assignment Management Service Methods ─────────────────────────────────

  /**
   * Get assignments for instructor (or all assignments for admin).
   */
  static async getAssignments(instructorId, userRole) {
    const filter = userRole === 'admin' ? {} : { instructorId: mongoose.Types.ObjectId.isValid(instructorId) ? new mongoose.Types.ObjectId(instructorId) : instructorId };
    const assignments = await Assignment.find(filter)
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      assignments.map(async (a) => {
        const submissionCount = await AssignmentSubmission.countDocuments({ assignmentId: a._id });
        const gradedCount = await AssignmentSubmission.countDocuments({ assignmentId: a._id, status: 'graded' });

        return {
          id: a._id.toString(),
          title: a.title,
          description: a.description || '',
          instructions: a.instructions || '',
          courseId: a.courseId?._id?.toString() || a.courseId?.toString() || '',
          courseTitle: a.courseId?.title || 'Assigned Course',
          lessonId: a.lessonId || '',
          dueDate: a.dueDate ? new Date(a.dueDate).toISOString() : new Date().toISOString(),
          maxScore: a.maxScore || 100,
          allowedFileTypes: a.allowedFileTypes || ['pdf', 'zip', 'docx', 'png', 'txt'],
          status: a.status || 'published',
          submissionCount,
          gradedCount,
          createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
        };
      })
    );

    return result;
  }

  /**
   * Create assignment with course ownership check.
   */
  static async createAssignment(instructorId, assignmentData) {
    if (!assignmentData.courseId) {
      throw AppError.badRequest('Course ID is required');
    }

    const course = await Course.findById(assignmentData.courseId).lean();
    if (!course) {
      throw AppError.notFound('Course');
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      throw AppError.forbidden('You can only create assignments for courses you instruct');
    }

    const newAssignment = await Assignment.create({
      title: assignmentData.title,
      description: assignmentData.description || '',
      instructions: assignmentData.instructions || '',
      courseId: assignmentData.courseId,
      lessonId: assignmentData.lessonId || '',
      instructorId: mongoose.Types.ObjectId.isValid(instructorId) ? new mongoose.Types.ObjectId(instructorId) : instructorId,
      dueDate: assignmentData.dueDate ? new Date(assignmentData.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: Number(assignmentData.maxScore) || 100,
      allowedFileTypes: assignmentData.allowedFileTypes || ['pdf', 'zip', 'docx', 'png', 'txt'],
      status: assignmentData.status || 'published',
    });

    return newAssignment;
  }

  /**
   * Update assignment with ownership check.
   */
  static async updateAssignment(instructorId, userRole, assignmentId, updateData) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw AppError.notFound('Assignment');
    }

    if (userRole !== 'admin' && assignment.instructorId.toString() !== instructorId.toString()) {
      throw AppError.forbidden('You do not have permission to modify this assignment');
    }

    if (updateData.title) assignment.title = updateData.title;
    if (updateData.description !== undefined) assignment.description = updateData.description;
    if (updateData.instructions !== undefined) assignment.instructions = updateData.instructions;
    if (updateData.dueDate) assignment.dueDate = new Date(updateData.dueDate);
    if (updateData.maxScore !== undefined) assignment.maxScore = Number(updateData.maxScore);
    if (updateData.allowedFileTypes) assignment.allowedFileTypes = updateData.allowedFileTypes;
    if (updateData.status) assignment.status = updateData.status;

    await assignment.save();
    return assignment;
  }

  /**
   * Delete assignment with ownership check.
   */
  static async deleteAssignment(instructorId, userRole, assignmentId) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw AppError.notFound('Assignment');
    }

    if (userRole !== 'admin' && assignment.instructorId.toString() !== instructorId.toString()) {
      throw AppError.forbidden('You do not have permission to delete this assignment');
    }

    await Assignment.findByIdAndDelete(assignmentId);
    await AssignmentSubmission.deleteMany({ assignmentId: assignment._id });
    return true;
  }

  /**
   * Get student submissions for an assignment with ownership check.
   */
  static async getAssignmentSubmissions(instructorId, userRole, assignmentId) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw AppError.notFound('Assignment');
    }

    if (userRole !== 'admin' && assignment.instructorId.toString() !== instructorId.toString()) {
      throw AppError.forbidden('You do not have permission to view submissions for this assignment');
    }

    const queryId = mongoose.Types.ObjectId.isValid(assignmentId) ? new mongoose.Types.ObjectId(assignmentId) : assignmentId;
    const submissions = await AssignmentSubmission.find({ assignmentId: queryId })
      .populate('studentId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    return submissions.map((s) => ({
      id: s._id.toString(),
      assignmentId: s.assignmentId.toString(),
      assignmentTitle: assignment.title,
      studentId: s.studentId?._id?.toString() || '',
      studentName: s.studentId?.name || 'Student',
      studentEmail: s.studentId?.email || '',
      studentAvatar: s.studentId?.avatar || '',
      fileUrl: s.fileUrl || '',
      fileName: s.fileName || 'Submission File',
      fileSize: s.fileSize || 0,
      textSubmission: s.textSubmission || '',
      status: s.status || 'submitted',
      score: s.score || 0,
      maxScore: assignment.maxScore || 100,
      feedback: s.feedback || '',
      submittedAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
      gradedAt: s.gradedAt ? new Date(s.gradedAt).toISOString() : null,
    }));
  }

  /**
   * Grade student submission with ownership check.
   */
  static async gradeSubmission(instructorId, userRole, submissionId, gradeData) {
    const submission = await AssignmentSubmission.findById(submissionId).populate('assignmentId');
    if (!submission) {
      throw AppError.notFound('Submission');
    }

    const assignment = submission.assignmentId;
    if (userRole !== 'admin' && submission.instructorId.toString() !== instructorId.toString() && assignment?.instructorId?.toString() !== instructorId.toString()) {
      throw AppError.forbidden('You do not have permission to grade this submission');
    }

    if (gradeData.score !== undefined) {
      submission.score = Math.min(assignment?.maxScore || 100, Math.max(0, Number(gradeData.score)));
    }
    if (gradeData.feedback !== undefined) {
      submission.feedback = gradeData.feedback;
    }
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = new mongoose.Types.ObjectId(instructorId);

    await submission.save();
    return submission;
  }

  /**
   * Submit assignment by student with file/text response.
   */
  static async submitAssignment(studentId, assignmentId, submitData, file) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw AppError.notFound('Assignment');
    }

    let fileUrl = submitData.fileUrl || '';
    let fileName = submitData.fileName || '';
    let fileSize = submitData.fileSize || 0;

    if (file) {
      fileName = file.originalname || 'assignment_submission';
      fileSize = file.size || 0;

      try {
        const { uploadToCloudinary } = require('../../utils/upload');
        const cloudResult = await uploadToCloudinary(file.buffer, {
          folder: 'lms/assignments',
          resource_type: 'auto',
        });
        fileUrl = cloudResult.secure_url;
      } catch (err) {
        // Disk fallback
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(__dirname, '../../../public/uploads/assignments');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const ext = file.originalname ? path.extname(file.originalname) : '.pdf';
        const diskFileName = `submission-${studentId}-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadsDir, diskFileName), file.buffer);
        fileUrl = `/uploads/assignments/${diskFileName}`;
      }
    }

    const studentObjId = mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : studentId;
    let submission = await AssignmentSubmission.findOne({ assignmentId: assignment._id, studentId: studentObjId });
    if (submission) {
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.fileName = fileName || submission.fileName;
      submission.fileSize = fileSize || submission.fileSize;
      submission.textSubmission = submitData.textSubmission || submission.textSubmission;
      submission.status = 'submitted';
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        assignmentId: assignment._id,
        courseId: assignment.courseId,
        studentId: studentObjId,
        instructorId: assignment.instructorId,
        fileUrl,
        fileName,
        fileSize,
        textSubmission: submitData.textSubmission || '',
        status: 'submitted',
      });
    }

    return submission;
  }

  /**
   * Get published assignments for a course (student/public view).
   */
  static async getCourseAssignments(courseId, studentId = null) {
    if (!courseId) throw AppError.badRequest('Course ID is required');

    const queryCourseId = mongoose.Types.ObjectId.isValid(courseId) ? new mongoose.Types.ObjectId(courseId) : courseId;
    const assignments = await Assignment.find({ courseId: queryCourseId, status: 'published' })
      .populate('courseId', 'title')
      .sort({ dueDate: 1 })
      .lean();

    const result = await Promise.all(
      assignments.map(async (a) => {
        let studentSubmission = null;
        if (studentId) {
          const queryStudentId = mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : studentId;
          const subQuery = AssignmentSubmission.findOne({
            assignmentId: a._id,
            studentId: queryStudentId,
          });
          studentSubmission = typeof subQuery?.lean === 'function' ? await subQuery.lean() : await subQuery;
        }

        return {
          id: a._id.toString(),
          title: a.title,
          description: a.description || '',
          instructions: a.instructions || '',
          courseId: a.courseId?._id?.toString() || a.courseId?.toString() || '',
          courseTitle: a.courseId?.title || '',
          dueDate: a.dueDate ? new Date(a.dueDate).toISOString() : '',
          maxScore: a.maxScore || 100,
          allowedFileTypes: a.allowedFileTypes || ['pdf', 'zip', 'docx', 'png', 'txt'],
          status: a.status || 'published',
          studentSubmission: studentSubmission
            ? {
                id: studentSubmission._id.toString(),
                fileUrl: studentSubmission.fileUrl || '',
                fileName: studentSubmission.fileName || '',
                textSubmission: studentSubmission.textSubmission || '',
                status: studentSubmission.status,
                score: studentSubmission.score || 0,
                feedback: studentSubmission.feedback || '',
                submittedAt: studentSubmission.createdAt,
              }
            : null,
        };
      })
    );

    return result;
  }

  /**
   * Get single assignment details by ID.
   */
  static async getAssignmentById(assignmentId, studentId = null) {
    const asgnQuery = Assignment.findById(assignmentId).populate('courseId', 'title');
    const assignment = typeof asgnQuery?.lean === 'function' ? await asgnQuery.lean() : await asgnQuery;
    if (!assignment) {
      throw AppError.notFound('Assignment');
    }

    let studentSubmission = null;
    if (studentId) {
      const queryStudentId = mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : studentId;
      const subQuery = AssignmentSubmission.findOne({
        assignmentId: assignment._id,
        studentId: queryStudentId,
      });
      studentSubmission = typeof subQuery?.lean === 'function' ? await subQuery.lean() : await subQuery;
    }

    return {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description || '',
      instructions: assignment.instructions || '',
      courseId: assignment.courseId?._id?.toString() || assignment.courseId?.toString() || '',
      courseTitle: assignment.courseId?.title || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString() : '',
      maxScore: assignment.maxScore || 100,
      allowedFileTypes: assignment.allowedFileTypes || ['pdf', 'zip', 'docx', 'png', 'txt'],
      status: assignment.status || 'published',
      studentSubmission: studentSubmission
        ? {
            id: studentSubmission._id.toString(),
            fileUrl: studentSubmission.fileUrl || '',
            fileName: studentSubmission.fileName || '',
            textSubmission: studentSubmission.textSubmission || '',
            status: studentSubmission.status,
            score: studentSubmission.score || 0,
            feedback: studentSubmission.feedback || '',
            submittedAt: studentSubmission.createdAt,
          }
        : null,
    };
  }
}

module.exports = InstructorService;
