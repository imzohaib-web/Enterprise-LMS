import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/modal';
import Button from '../../../components/ui/button/Button';
import { CreateDiscussionInput, IDiscussion } from '../types';
import { Tag, Paperclip, Plus, Trash2, Send } from 'lucide-react';

interface DiscussionComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDiscussionInput) => Promise<void> | void;
  initialData?: IDiscussion | null;
  courseId: string;
  isSubmitting?: boolean;
}

export const DiscussionComposer: React.FC<DiscussionComposerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  courseId,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachments, setAttachments] = useState<{ name?: string; url: string; type?: string }[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setTags(initialData.tags || []);
      setAttachments(initialData.attachments || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setAttachments([]);
    }
  }, [initialData, isOpen]);

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const formatted = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(formatted)) {
      setTags([...tags, formatted]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddAttachment = () => {
    if (!attachmentUrl.trim()) return;
    setAttachments([
      ...attachments,
      {
        name: attachmentName.trim() || 'Attachment',
        url: attachmentUrl.trim(),
        type: 'file',
      },
    ]);
    setAttachmentName('');
    setAttachmentUrl('');
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    await onSubmit({
      courseId,
      title: title.trim(),
      content: content.trim(),
      tags,
      attachments,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Edit Discussion Post' : 'Create New Discussion'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Share topics, ask questions, and start technical discussions with course members.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How do we manage async React Query state effectively?"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Post Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your question or discussion in detail..."
              className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-y"
            />
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g., react, typescript, backend"
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
                />
                <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
              <Button onClick={handleAddTag} variant="outline" size="sm">
                Add Tag
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-full"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-500"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Attachments / Links (Optional)
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="Name (e.g., Repo Link)"
                className="sm:w-1/3 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
              />
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
              />
              <Button
                onClick={handleAddAttachment}
                variant="outline"
                size="sm"
                startIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add
              </Button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1 pt-1">
                {attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="flex items-center gap-1.5 truncate text-gray-700 dark:text-gray-300">
                      <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                      {att.name || 'Attachment'} ({att.url})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(i)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button onClick={onClose} variant="outline" size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              size="sm"
              variant="primary"
              disabled={!title.trim() || !content.trim() || isSubmitting}
              startIcon={<Send className="w-3.5 h-3.5" />}
            >
              {isSubmitting
                ? 'Submitting...'
                : initialData
                ? 'Update Post'
                : 'Publish Discussion'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default DiscussionComposer;
