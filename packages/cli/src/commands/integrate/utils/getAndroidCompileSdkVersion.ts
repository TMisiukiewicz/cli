import path from 'path';
import fs from 'fs-extra';
import g2js from 'gradle-to-js/lib/parser';

export default async function getAndroidCompileSdkVersion(
  projectRoot: string,
  appLevelBuildGradlePath: string,
) {
  const appBuildGradlePath = path.join(projectRoot, appLevelBuildGradlePath);

  if (!fs.existsSync(appBuildGradlePath)) {
    throw new Error('app-level build.gradle file not found');
  }

  const buildGradle = await g2js.parseFile(appBuildGradlePath);
  return buildGradle.android.compileSdkVersion;
}
