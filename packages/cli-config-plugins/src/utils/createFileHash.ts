import crypto from 'crypto';

const createFileHash = (contents: string) =>
  crypto.createHash('sha1').update(contents).digest('hex');

export default createFileHash;
