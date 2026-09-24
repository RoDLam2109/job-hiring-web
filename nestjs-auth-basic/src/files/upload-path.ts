import { isAbsolute, join, resolve } from 'path';

// Resolve from the module location in both src/files and dist/files.
export const PUBLIC_DIRECTORY = resolve(__dirname, '..', '..', 'src', 'public');

// Read at runtime, after ConfigModule has loaded .env.
// UPLOAD_DIRECTORY is the images root: company/ and resume/ go inside it.
export function getUploadDirectory(): string {
  const configured = process.env.UPLOAD_DIRECTORY?.trim();
  if (!configured) return join(PUBLIC_DIRECTORY, 'images');
  if (!isAbsolute(configured)) {
    throw new Error('UPLOAD_DIRECTORY must be an absolute filesystem path');
  }
  return resolve(configured);
}
