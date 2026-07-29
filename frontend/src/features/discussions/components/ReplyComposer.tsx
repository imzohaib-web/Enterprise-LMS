import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import Button from '../../../components/ui/button/Button';

interface ReplyComposerProps {
  onSubmit: (content: string, parentReplyId?: string | null) => Promise<void> | void;
  parentReplyId?: string | null;
  onCancel?: () => void;
  placeholder?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
}

export const ReplyComposer: React.FC<ReplyComposerProps> = ({
  onSubmit,
  parentReplyId = null,
  onCancel,
  placeholder = 'Write a reply...',
  isSubmitting = false,
  isDisabled = false,
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSubmitting || isDisabled) return;
    await onSubmit(content.trim(), parentReplyId);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          rows={3}
          disabled={isDisabled || isSubmitting}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isDisabled ? 'Replies are locked for this discussion.' : placeholder}
          className="w-full p-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none disabled:opacity-60"
        />
      </div>

      <div className="flex items-center justify-between">
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            startIcon={<X className="w-3.5 h-3.5" />}
          >
            Cancel
          </Button>
        )}
        <div className="ml-auto">
          <Button
            onClick={() => handleSubmit()}
            size="sm"
            variant="primary"
            disabled={!content.trim() || isSubmitting || isDisabled}
            startIcon={<Send className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? 'Posting...' : 'Post Reply'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ReplyComposer;
