import path from 'path';
import fs from 'fs-extra';
import {Config} from '@react-native-community/cli-types';
import {
  CLIError,
  getLoader,
  editTemplate,
} from '@react-native-community/cli-tools';
import {installPods} from '@react-native-community/cli-doctor';
import applyPlugins from '../../tools/applyPlugins';
import {
  createReactNativeFolder,
  getCacheFile,
  saveCacheFile,
  updateCachedConfig,
  updateMultipleCachedKeys,
} from '../../utils/reactNative';
import {createFileHash} from '../../utils/createFileHash';
import {getPackageJson} from '@expo/config';
import {createPackageJsonCheckSums} from '../../tools/updatePackageJson';
import {removeGeneratedFiles} from '../../tools/removeGeneratedFiles';

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

  loader.start();
  const {root} = config;

  if (options?.clean) {
    removeGeneratedFiles(root);
  }

  const appJson: any = fs.readJSONSync(path.join(root, 'app.json'), {
    encoding: 'utf8',
  });

  try {
    const isFreshInstallation = !fs.existsSync(
      path.join(root, '.react-native'),
    );

    if (isFreshInstallation) {
      createReactNativeFolder(root);
      updateCachedConfig(root, 'appName', appJson.name);
    }
  } catch {
    throw new CLIError('Failed to create .react-native folder.');
  }

  const cache = getCacheFile(root);
  const appJsonHash = createFileHash(JSON.stringify(appJson));

  let keysToUpdate = {};

  if (appJsonHash !== cache.appJson) {
    keysToUpdate = {
      appJson: appJsonHash,
    };
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
        placeholderName:
          cache.appName !== appJson.name ? cache.appName : 'HelloWorld',
      });

      await applyPlugins();
    } catch {
      loader.fail();
      throw new CLIError('Failed to generate native projects.');
    }
  }

  loader.succeed();

  const podsLoader = getLoader({
    text: 'Installing CocoaPods dependencies...',
  });
  try {
    const packageJson = getPackageJson(root);
    const checksums = createPackageJsonCheckSums(packageJson);

    const hasNewDependencies = checksums.dependencies !== cache.dependencies;
    const hasNewDevDependencies =
      checksums.devDependencies !== cache.devDependencies;

    if (
      (hasNewDependencies || hasNewDevDependencies) &&
      process.platform === 'darwin'
    ) {
      keysToUpdate = {
        ...keysToUpdate,
        dependencies: checksums.dependencies,
        devDependencies: checksums.devDependencies,
      };
      await installPods({directory: root, loader: podsLoader});
      podsLoader.succeed();
    }

    const cachedValues = updateMultipleCachedKeys(cache, keysToUpdate);

    saveCacheFile(root, cachedValues);
  } catch {
    podsLoader.fail();
    throw new CLIError('Failed to generate native projects.');
  }
};

export default generate;
