export const WORKSHEET_IMAGES_BUCKET = 'worksheet-images';

export const WORKSHEET_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const WORKSHEET_IMAGE_ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export function extensionForImageMime(mime: string): string | null {
  return MIME_TO_EXT[mime] ?? null;
}

export function validateWorksheetImageFile(file: File): string | null {
  if (!WORKSHEET_IMAGE_ALLOWED_TYPES.has(file.type)) {
    return 'Use a JPEG, PNG, WebP, or GIF image.';
  }
  if (file.size > WORKSHEET_IMAGE_MAX_BYTES) {
    return 'Image must be 5 MB or smaller.';
  }
  return null;
}
