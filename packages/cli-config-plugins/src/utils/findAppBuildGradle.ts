import fs from 'fs-extra';
import path from 'path';

function findAppBuildGradle(startDir: string): string {
  const files = fs.readdirSync(startDir);

  for (const file of files) {
    const filePath = path.join(startDir, file);

    if (fs.statSync(filePath).isDirectory()) {
      try {
        const appDir = findAppBuildGradle(filePath);
        return appDir;
      } catch (error) {
        // Ignore the error and continue searching
      }
    } else if (file === 'build.gradle') {
      return startDir;
    }
  }

  throw new Error('app-level build.gradle file not found');
}

export default findAppBuildGradle;
