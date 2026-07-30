import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import Button from '../../../components/ui/button/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onCreateNew?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No discussions found',
  description = 'There are no course discussions matching your filter criteria. Be the first to start a conversation!',
  onCreateNew,
  actionText = 'Start a Discussion',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-center shadow-sm">
      <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 mb-4">
        <MessageSquare className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">{description}</p>
      {onCreateNew && (
        <Button onClick={onCreateNew} size="md" variant="primary" startIcon={<Plus className="w-4 h-4" />}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
