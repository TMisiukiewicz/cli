import path from 'path';
import fs from 'fs-extra';
import {Config} from '@react-native-community/cli-types';
import {CLIError} from '@react-native-community/cli-tools';
import applyPlugins from '../../tools/applyPlugins';

const generate = async (_: Array<string>, ctx: Config) => {
  generateNativeProjects(ctx);
};

export const generateNativeProjects = (
  config: Config,
  platforms: Array<'android' | 'ios'> = ['android', 'ios'],
) => {
  const {root} = config;

  const srcDir = path.join(root, 'node_modules', 'react-native', 'template');
  const destDir = root;

  try {
    if (
      platforms.includes('android') &&
      fs.existsSync(path.join(destDir, 'android'))
    ) {
      fs.removeSync(path.join(destDir, 'android'));
    }

    if (platforms.includes('ios') && fs.existsSync(path.join(destDir, 'ios'))) {
      fs.removeSync(path.join(destDir, 'ios'));
    }

    if (platforms.includes('android')) {
      fs.copySync(path.join(srcDir, 'android'), path.join(destDir, 'android'));
    }
    if (platforms.includes('ios')) {
      fs.copySync(path.join(srcDir, 'ios'), path.join(destDir, 'ios'));
    }

    applyPlugins();
  } catch {
    throw new CLIError('Failed to generate native projects.');
  }
};

export default generate;
