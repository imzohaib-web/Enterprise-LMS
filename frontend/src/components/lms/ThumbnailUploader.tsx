import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { courseService } from '../../services/course.service';

interface ThumbnailUploaderProps {
  value?: string;
  onChange: (thumbnailUrl: string, file?: File) => void;
  courseId?: string;
}

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const ThumbnailUploader: React.FC<ThumbnailUploaderProps> = ({
  value = '',
  onChange,
  courseId,
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState<string>(value);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Invalid image type. Please select JPG, PNG, WEBP, or GIF.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image size must be less than ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    if (courseId) {
      // Direct upload if course exists
      try {
        setIsUploading(true);
        setUploadProgress(20);
        const res = await courseService.uploadThumbnail(courseId, file);
        setUploadProgress(100);
        const uploadedUrl = res.data?.data?.thumbnailUrl || localUrl;
        setPreviewUrl(uploadedUrl);
        onChange(uploadedUrl, file);
        toast.success('Thumbnail uploaded successfully!');
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to upload thumbnail image');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Draft mode before creation: pass file back
      onChange(localUrl, file);
      toast.success('Image selected!');
    }
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }
    setPreviewUrl(urlInput.trim());
    onChange(urlInput.trim());
    toast.success('Thumbnail URL set!');
  };

  const handleClear = () => {
    setPreviewUrl('');
    setUrlInput('');
    onChange('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Course Thumbnail Image
        </label>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              tab === 'upload'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              tab === 'url'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {/* Preview Box */}
      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-900 group aspect-video max-h-48 flex items-center justify-center">
          <img
            src={previewUrl}
            alt="Course Thumbnail Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Remove / Change
            </button>
          </div>
        </div>
      ) : tab === 'upload' ? (
        <div className="relative">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            id="course-thumbnail-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="course-thumbnail-upload"
            className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-800/40 hover:bg-indigo-50/20 transition group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Click to upload thumbnail from device
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              JPG, PNG, WEBP, GIF up to 5MB (16:9 ratio recommended)
            </p>
          </label>

          {isUploading && (
            <div className="mt-2 space-y-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 text-right">Uploading image... {uploadProgress}%</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://images.unsplash.com/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Apply URL
          </button>
        </div>
      )}
    </div>
  );
};

export default ThumbnailUploader;
