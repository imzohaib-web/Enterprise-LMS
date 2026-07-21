import { QuizModel } from './assessment.model';
import { IQuizDocument } from './assessment.types';
import { CreateQuizInput, UpdateQuizInput } from './assessment.validation';

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
}
