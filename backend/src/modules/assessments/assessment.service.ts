import mongoose from 'mongoose';
import { QuizModel, QuizAttemptModel } from './assessment.model';
import { IQuizDocument, IQuizEvaluationResponse } from './assessment.types';
import { CreateQuizInput, UpdateQuizInput, SubmitQuizInput } from './assessment.validation';

export class AssessmentService {
  public async createQuiz(quizData: CreateQuizInput): Promise<IQuizDocument> {
    const quiz = new QuizModel(quizData);
    return await quiz.save();
  }

  public async getAllQuizzes(filter: { courseId?: string; lessonId?: string } = {}): Promise<IQuizDocument[]> {
    const queryFilter: Record<string, any> = {};
    if (filter.courseId) {
      queryFilter.courseId = filter.courseId;
    }
    if (filter.lessonId) {
      queryFilter.lessonId = filter.lessonId;
    }
    return await QuizModel.find(queryFilter).sort({ createdAt: -1 }).exec();
  }

  public async getQuizById(id: string): Promise<IQuizDocument | null> {
    return await QuizModel.findById(id).exec();
  }

  public async updateQuiz(id: string, updateData: UpdateQuizInput): Promise<IQuizDocument | null> {
    return await QuizModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  public async deleteQuiz(id: string): Promise<IQuizDocument | null> {
    return await QuizModel.findByIdAndDelete(id).exec();
  }

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
      // Fallback save for Mongo standalone mode without replica set
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

    return {
      score: totalScore,
      percentage,
      correctAnswers: correctAnswersCount,
      wrongAnswers: wrongAnswersCount,
      passed,
      timeTaken: this.formatTimeTaken(timeTakenSeconds),
    };
  }

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
