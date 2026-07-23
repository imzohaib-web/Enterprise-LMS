import mongoose from 'mongoose';
import { QuizModel, QuizAttemptModel } from './assessment.model';
import { IQuizDocument, IQuizEvaluationResponse } from './assessment.types';
import { CreateQuizInput, UpdateQuizInput, SubmitQuizInput } from './assessment.validation';
import { ProgressService } from '../progress/progress.service';

/**
 * Service layer encapsulating core business logic for Assessment & Quiz operations.
 */
export class AssessmentService {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  /**
   * Create a new MCQ Quiz document.
   * @param quizData Validated quiz input data
   */
  public async createQuiz(quizData: CreateQuizInput): Promise<IQuizDocument> {
    const quiz = new QuizModel(quizData);
    return await quiz.save();
  }

  /**
   * Retrieve all quizzes matching optional courseId or lessonId filters.
   * Uses lean queries for optimized read performance.
   * @param filter Filter criteria for courseId or lessonId
   */
  public async getAllQuizzes(filter: { courseId?: string; lessonId?: string } = {}): Promise<IQuizDocument[]> {
    const queryFilter: Record<string, any> = {};
    if (filter.courseId) {
      queryFilter.courseId = filter.courseId;
    }
    if (filter.lessonId) {
      queryFilter.lessonId = filter.lessonId;
    }
    return await QuizModel.find(queryFilter)
      .sort({ createdAt: -1 })
      .lean()
      .exec() as IQuizDocument[];
  }

  /**
   * Fetch a single quiz by its unique MongoDB Object ID.
   * @param id Quiz ObjectId string
   */
  public async getQuizById(id: string): Promise<IQuizDocument | null> {
    return await QuizModel.findById(id).exec();
  }

  /**
   * Update an existing quiz document by ID.
   * @param id Quiz ObjectId string
   * @param updateData Partial validated quiz update fields
   */
  public async updateQuiz(id: string, updateData: UpdateQuizInput): Promise<IQuizDocument | null> {
    return await QuizModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  /**
   * Delete a quiz document by ID.
   * @param id Quiz ObjectId string
   */
  public async deleteQuiz(id: string): Promise<IQuizDocument | null> {
    return await QuizModel.findByIdAndDelete(id).exec();
  }

  /**
   * Process a student's quiz attempt submission, auto-evaluating MCQ answers,
   * calculating total score & percentage, persisting the attempt atomically,
   * and notifying ProgressService.
   *
   * @param quizId Quiz ObjectId string
   * @param studentId Student User ObjectId string
   * @param submissionInput Submitted answer payload and time taken
   */
  public async submitQuizAttempt(
    quizId: string,
    studentId: string,
    submissionInput: SubmitQuizInput
  ): Promise<IQuizEvaluationResponse> {
    const quiz = await QuizModel.findById(quizId).exec();
    if (!quiz) {
      throw new Error(`Quiz not found with ID: ${quizId}`);
    }

    let totalScore = 0;
    let totalPossibleMarks = 0;
    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;

    const evaluatedAnswers = quiz.questions.map((q) => {
      const qIdStr = q._id ? q._id.toString() : '';
      const qMarks = q.marks || 1;
      totalPossibleMarks += qMarks;

      const submitted = submissionInput.answers.find(
        (a) => a.questionId === qIdStr || a.questionId === q.question
      );

      const isCorrect = submitted ? submitted.selectedOption === q.correctAnswer : false;
      const marksAwarded = isCorrect ? qMarks : 0;

      if (isCorrect) {
        correctAnswersCount++;
        totalScore += qMarks;
      } else {
        wrongAnswersCount++;
      }

      return {
        questionId: qIdStr || q.question,
        selectedOption: submitted ? submitted.selectedOption : '',
        isCorrect,
        marksAwarded,
      };
    });

    const percentage = totalPossibleMarks > 0
      ? Number(((totalScore / totalPossibleMarks) * 100).toFixed(2))
      : 0;

    const passed = percentage >= quiz.passingScore;
    const timeTakenSeconds = submissionInput.timeTakenSeconds || 0;

    let session: mongoose.ClientSession | null = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const attempt = new QuizAttemptModel({
        quizId,
        studentId,
        answers: evaluatedAnswers,
        score: totalScore,
        totalMarks: totalPossibleMarks,
        percentage,
        passed,
        correctAnswersCount,
        wrongAnswersCount,
        timeTakenSeconds,
      });

      await attempt.save({ session });
      await session.commitTransaction();
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      // Fallback save for standalone MongoDB deployments without replica set
      const attemptFallback = new QuizAttemptModel({
        quizId,
        studentId,
        answers: evaluatedAnswers,
        score: totalScore,
        totalMarks: totalPossibleMarks,
        percentage,
        passed,
        correctAnswersCount,
        wrongAnswersCount,
        timeTakenSeconds,
      });
      await attemptFallback.save();
    } finally {
      if (session) {
        session.endSession();
      }
    }

    // Notify Progress Service asynchronously to update student course progress
    if (quiz.courseId) {
      try {
        await this.progressService.recordQuizSubmission(
          studentId,
          quiz.courseId.toString(),
          quizId,
          totalScore,
          percentage
        );
      } catch (err) {
        console.error('Failed to trigger ProgressService on quiz submission:', err);
      }
    }

    return {
      score: totalScore,
      percentage,
      correctAnswers: correctAnswersCount,
      wrongAnswers: wrongAnswersCount,
      passed,
      timeTaken: this.formatTimeTaken(timeTakenSeconds),
    };
  }

  /**
   * Helper utility to format time taken in seconds into human readable duration string.
   */
  private formatTimeTaken(seconds: number): string {
    if (!seconds || seconds <= 0) return '0 seconds';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0 && secs > 0) {
      return `${mins} minute${mins > 1 ? 's' : ''} ${secs} second${secs > 1 ? 's' : ''}`;
    } else if (mins > 0) {
      return `${mins} minute${mins > 1 ? 's' : ''}`;
    } else {
      return `${secs} second${secs > 1 ? 's' : ''}`;
    }
  }
}
