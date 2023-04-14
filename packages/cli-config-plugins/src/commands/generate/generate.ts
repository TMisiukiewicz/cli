import path from 'path';
import fs from 'fs-extra';
import {Config} from '@react-native-community/cli-types';
import {CLIError, getLoader} from '@react-native-community/cli-tools';
import {editTemplate} from '@react-native-community/cli-tools';
import applyPlugins from '../../tools/applyPlugins';
import {
  createReactNativeFolder,
  generateFileHash,
  getCachedConfigValue,
  hasValueChanged,
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

  if (options?.clean) {
    try {
      fs.removeSync(path.join(root, 'android'));
      fs.removeSync(path.join(root, 'ios'));
      fs.removeSync(path.join(root, '.react-native'));
    } catch {
      throw new CLIError('Failed to clean native projects');
    }
  }

  const appJson: any = fs.readJSONSync(path.join(root, 'app.json'), {
    encoding: 'utf8',
  });

  const isFreshInstallation = !fs.existsSync(path.join(root, '.react-native'));

  if (isFreshInstallation) {
    createReactNativeFolder(root);
    updateCachedConfig(root, 'appName', appJson.name);
  }

  const cachedAppName = getCachedConfigValue(root, 'appName');
  const hasAppNameChanged = hasValueChanged(root, 'appName', appJson.name);
  const appJsonHash = generateFileHash(path.join(root, 'app.json'));
  const didAppJsonHashChange = hasValueChanged(root, 'appJson', appJsonHash);

  if (didAppJsonHashChange) {
    const srcDir = path.join(root, 'node_modules', 'react-native', 'template');
    const destDir = root;
    try {
      const appJsonContent = JSON.parse(
        fs.readFileSync(path.join(root, 'app.json'), {
          encoding: 'utf8',
        }),
      );

      if (
        platforms.includes('android') &&
        !fs.existsSync(path.join(destDir, 'android'))
      ) {
        fs.copySync(
          path.join(srcDir, 'android'),
          path.join(destDir, 'android'),
        );
      }
      if (
        platforms.includes('ios') &&
        !fs.existsSync(path.join(destDir, 'ios'))
      ) {
        fs.copySync(path.join(srcDir, 'ios'), path.join(destDir, 'ios'));
      }

      await editTemplate.changePlaceholderInTemplate({
        projectName: appJsonContent.name,
        projectTitle: appJsonContent.displayName,
        placeholderTitle: 'Hello App Display Name',
        placeholderName: hasAppNameChanged ? cachedAppName : 'HelloWorld',
      });

      await applyPlugins();
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
