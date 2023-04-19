import {ModPlatform} from '@expo/config-plugins';
import fs from 'fs-extra';
import path from 'path';

const copyTemplateFiles = (
  srcDir: string,
  destDir: string,
  platforms: ModPlatform[],
) => {
  if (
    platforms.includes('android') &&
    !fs.existsSync(path.join(destDir, 'android'))
  ) {
    fs.copySync(path.join(srcDir, 'android'), path.join(destDir, 'android'));
  }

  if (platforms.includes('ios') && !fs.existsSync(path.join(destDir, 'ios'))) {
    fs.copySync(path.join(srcDir, 'ios'), path.join(destDir, 'ios'));
  }
};

export default copyTemplateFiles;
