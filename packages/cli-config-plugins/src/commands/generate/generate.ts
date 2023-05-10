import path from 'path';
import fs from 'fs-extra';
import {Config} from '@react-native-community/cli-types';
import {
  CLIError,
  getLoader,
  editTemplate,
} from '@react-native-community/cli-tools';
import {installPods} from '@react-native-community/cli-doctor';
import {AppJSONConfig, getPackageJson} from '@expo/config';
import {
  applyPlugins,
  copyTemplateFiles,
  createFileHash,
  createPackageJsonCheckSums,
  createReactNativeFolder,
  getCacheFile,
  removeGeneratedFiles,
  saveCacheFile,
  updateMultipleCachedKeys,
} from '../../utils';
import {ModPlatform} from '@expo/config-plugins';

export interface GenerateFlags {
  clean?: boolean;
  ios?: boolean;
  android?: boolean;
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
  const platformsNotDefined =
    options?.ios === undefined && options?.android === undefined;

  let platforms: ModPlatform[] = platformsNotDefined ? ['android', 'ios'] : [];

  if (options?.ios) {
    platforms.push('ios');
  }
  if (options?.android) {
    platforms.push('android');
  }

  const loader = getLoader({text: 'Generating native code...'});

  loader.start();
  const {root} = config;

  if (options?.clean) {
    removeGeneratedFiles(root);
  }

  const appJson: AppJSONConfig = fs.readJSONSync(path.join(root, 'app.json'), {
    encoding: 'utf8',
  });

  const isFreshInstallation = !fs.existsSync(path.join(root, '.react-native'));
  const isFreshAndroidRun =
    !fs.existsSync(path.join(root, 'android')) && platforms.includes('android');
  const isFreshIOSRun =
    !fs.existsSync(path.join(root, 'ios')) && platforms.includes('ios');

  if (isFreshInstallation) {
    createReactNativeFolder(root);
    saveCacheFile(root, {appName: appJson.name as string});
  }

  const cache = getCacheFile(root);
  const appJsonHash = createFileHash(JSON.stringify(appJson));

  let keysToUpdate = {};

  // this is the line that is causing the error - if android folder exists it fails to run ios and vice versa
  if (appJsonHash !== cache.appJson || isFreshAndroidRun || isFreshIOSRun) {
    keysToUpdate = {
      appJson: appJsonHash,
    };

    const srcDir = path.join(root, 'node_modules', 'react-native', 'template');
    const destDir = root;

    copyTemplateFiles(srcDir, destDir, platforms);

    try {
      if (platforms.includes('android')) {
        await overwritePlaceholders(
          'android',
          cache.appName as string,
          appJson.name,
        );
      }

      if (platforms.includes('ios')) {
        await overwritePlaceholders(
          'ios',
          cache.appName as string,
          appJson.name,
        );
      }
      await applyPlugins(platforms);
    } catch {
      throw new CLIError('Failed to apply changes in native projects.');
    }
  }

  loader.succeed();

  const packageJson = getPackageJson(root);
  const checksums = createPackageJsonCheckSums(packageJson);

  const hasNewDependencies = checksums.dependencies !== cache.dependencies;
  const hasNewDevDependencies =
    checksums.devDependencies !== cache.devDependencies;

  if (
    (hasNewDependencies || hasNewDevDependencies || isFreshIOSRun) &&
    process.platform === 'darwin'
  ) {
    keysToUpdate = {
      ...keysToUpdate,
      dependencies: checksums.dependencies,
      devDependencies: checksums.devDependencies,
    };

    if (platforms.includes('ios')) {
      const podsLoader = getLoader({
        text: 'Installing CocoaPods dependencies...',
      });

      try {
        await installPods({directory: root, loader: podsLoader});
        podsLoader.succeed();
      } catch {
        podsLoader.fail();
        throw new CLIError('Failed to generate native projects.');
      }
    }

    const cachedValues = updateMultipleCachedKeys(cache, keysToUpdate);

    saveCacheFile(root, cachedValues);
  }
};

export const overwritePlaceholders = async (
  platform: 'ios' | 'android',
  cachedName: string,
  appName: string,
  projectRoot?: string,
) => {
  const originalRoot = process.cwd();
  process.chdir(
    projectRoot ? `${projectRoot}/${platform}` : `${originalRoot}/${platform}`,
  );

  await editTemplate.changePlaceholderInTemplate({
    projectName: appName,
    projectTitle: appName,
    placeholderTitle: 'Hello App Display Name',
    placeholderName: cachedName !== appName ? appName : 'HelloWorld',
  });

  process.chdir(originalRoot);
};

export default generate;
