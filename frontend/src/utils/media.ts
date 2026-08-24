/**
 * Normalizes media/document/video URLs for reliable playback and downloads.
 * Converts relative backend paths (e.g., '/uploads/file.mp4') to absolute URLs (e.g., 'http://localhost:5000/uploads/file.mp4').
 * Leaves absolute URLs (http://, https://, blob:, data:) unchanged.
 */
export const getMediaUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  const backendBase = (import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendBase}${cleanPath}`;
};

/**
 * Returns appropriate MIME type string based on file extension or resource type
 */
export const getMimeType = (urlOrName?: string, typeHint?: string): string => {
  if (!urlOrName) return 'video/mp4';
  const clean = urlOrName.split('?')[0].split('#')[0].toLowerCase();
  const ext = clean.split('.').pop() || '';

  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    ogg: 'video/ogg',
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    txt: 'text/plain',
    csv: 'text/csv',
  };

  if (mimeMap[ext]) return mimeMap[ext];
  if (typeHint && mimeMap[typeHint.toLowerCase()]) return mimeMap[typeHint.toLowerCase()];
  return 'application/octet-stream';
};

/**
 * Checks if a URL or filename points to a browser-renderable PDF
 */
export const isPdfFile = (urlOrName?: string): boolean => {
  if (!urlOrName) return false;
  const clean = urlOrName.split('?')[0].split('#')[0].toLowerCase();
  return clean.endsWith('.pdf') || clean.includes('/pdf/');
};

/**
 * Checks if a URL or filename points to an image
 */
export const isImageFile = (urlOrName?: string): boolean => {
  if (!urlOrName) return false;
  const clean = urlOrName.split('?')[0].split('#')[0].toLowerCase();
  return /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(clean);
};
