import fs from 'fs-extra';
import path from 'path';
import {CLIError} from '@react-native-community/cli-tools';

export const removeGeneratedFiles = async (projectRoot: string) => {
  try {
    fs.removeSync(path.join(projectRoot, 'android'));
    fs.removeSync(path.join(projectRoot, 'ios'));
    fs.removeSync(path.join(projectRoot, '.react-native'));
  } catch {
    throw new CLIError('Failed to clean native projects');
  }
};
