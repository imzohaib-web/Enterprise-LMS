import React from 'react';
import { QuizEvaluationResult } from '../types';
import { ResultCard } from '../components/ResultCard';

interface QuizResultProps {
  result: QuizEvaluationResult;
  onBackToList: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({ result, onBackToList }) => {
  return (
    <div className="py-6">
      <ResultCard result={result} onBackToList={onBackToList} />
    </div>
  );
};
