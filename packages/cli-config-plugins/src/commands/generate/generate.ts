import path from 'path';
import fs from 'fs-extra';
import {Config} from '@react-native-community/cli-types';
import {CLIError, getLoader} from '@react-native-community/cli-tools';
import applyPlugins from '../../tools/applyPlugins';
import {
  createReactNativeFolder,
  generateFileHash,
  hasHashChanged,
  updateCachedConfig,
} from '../../utils/reactNative';

export interface GenerateFlags {
  clean?: boolean;
  platform?: Array<'android' | 'ios'>;
}

const generate = async (
  _: Array<string>,
  ctx: Config,
  options?: GenerateFlags,
) => {
  generateNativeProjects(ctx, options);
};

export const generateNativeProjects = async (
  config: Config,
  options?: GenerateFlags,
) => {
  const platforms = options?.platform || ['android', 'ios'];
  const loader = getLoader({text: 'Generating native projects...'});
  const {root} = config;

  if (!fs.existsSync(path.join(root, '.react-native'))) {
    createReactNativeFolder(root);
  }

  const appJsonHash = generateFileHash(path.join(root, 'app.json'));
  const didHashChange = hasHashChanged(root, 'appJson', appJsonHash);

  if (didHashChange || options?.clean) {
    const srcDir = path.join(root, 'node_modules', 'react-native', 'template');
    const destDir = root;
    try {
      if (
        (platforms.includes('android') &&
          !fs.existsSync(`${destDir}/android`)) ||
        options?.clean
      ) {
        fs.copySync(
          path.join(srcDir, 'android'),
          path.join(destDir, 'android'),
        );
      }
      if (
        (platforms.includes('ios') && !fs.existsSync(`${destDir}/ios`)) ||
        options?.clean
      ) {
        fs.copySync(path.join(srcDir, 'ios'), path.join(destDir, 'ios'));
      }

      applyPlugins();

      // Update app.json md5 after succesfull updating native projects
      updateCachedConfig(root, 'appJson', appJsonHash);
      loader.succeed();
    } catch {
      loader.fail();
      throw new CLIError('Failed to generate native projects.');
    }
  }
};

export default generate;
