import * as fs from 'fs';
import * as crypto from 'crypto';

export function shouldExcludePath(path: string): boolean {
  const excludedPaths = [
    'build',
    'Pods',
    'Podfile.lock',
    'project.pbxproj',
    '.xcworkspace',
  ];
  for (const excludedPath of excludedPaths) {
    if (path.includes(excludedPath)) {
      return true;
    }
  }
  return false;
}

export function sha1HashFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1');
    const stream = fs.createReadStream(path);

    stream.on('data', (data) => {
      hash.update(data);
    });
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    stream.on('error', (error) => {
      reject(error);
    });
  });
}

export async function sha1HashFolderRecursive(path: string): Promise<string> {
  const stats = fs.statSync(path);

  if (stats.isDirectory()) {
    const files = fs.readdirSync(path).sort();
    const promises = files
      .filter((file) => !shouldExcludePath(`${path}/${file}`))
      .map((file) => sha1HashFolderRecursive(`${path}/${file}`));
    const results = await Promise.all(promises);
    const concatenatedHash = results.join('');

    const hash = crypto
      .createHash('sha1')
      .update(concatenatedHash)
      .digest('hex');
    return hash;
  } else {
    const sha1File = await sha1HashFile(path);

    return sha1File;
  }
}

export function compareHashes(hash1: string, hash2: string): boolean {
  return hash1 === hash2;
}
