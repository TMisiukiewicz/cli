import crypto from 'crypto';

export const createFileHash = (contents: string) =>
  crypto.createHash('sha1').update(contents).digest('hex');
