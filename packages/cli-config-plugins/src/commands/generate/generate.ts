import path from 'path';
import fs from 'fs-extra';
import {Config} from '@react-native-community/cli-types';
import {CLIError} from '@react-native-community/cli-tools';

const generate = async (_: Array<string>, ctx: Config) => {
  generateNativeProjects(ctx);
};

export const generateNativeProjects = (config: Config) => {
  const {root} = config;

  const srcDir = path.join(root, 'node_modules', 'react-native', 'template');
  const destDir = root;

  try {
    fs.copySync(path.join(srcDir, 'android'), path.join(destDir, 'android'), {
      overwrite: true,
    });
    fs.copySync(path.join(srcDir, 'ios'), path.join(destDir, 'ios'), {
      overwrite: true,
    });
  } catch {
    throw new CLIError('Failed to generate native projects.');
  }
};

export default generate;
