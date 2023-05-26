//@ts-nocheck
import {CLIError, getLoader, logger} from '@react-native-community/cli-tools';
import {Config} from '@react-native-community/cli-types';
import {ConfigPlugins} from '@react-native-community/cli-config-plugins';
import path from 'path';
import prompts from 'prompts';
import fs from 'fs-extra';
import execa from 'execa';
import {Ora} from 'ora';
import semver from 'semver';
import applyPlugins from './utils/applyPlugins';
import copyEntryFiles from './utils/copyEntryFiles';
import {SemVer} from 'semver';
import g2js from 'gradle-to-js/lib/parser';

const MIN_SUPPORTED_IOS_DEPLOYMENT_TARGET = '10.0';

const IOS_DEPLOYMENT_TARGETS_RN_VERSIONS = {
  '12.4': ['0.69', '0.70', '0.71', '0.72'],
  '11.0': ['0.68'],
  '10.0': ['0.64', '0.65', '0.66', '0.67'],
};

const ANDROID_COMPILE_SDK_VERSIONS = {
  '33': ['0.71'],
  '31': ['0.68, 0.69, 0.70'],
  '30': ['0.65', '0.66', '0.67'],
  '29': ['0.64'],
};

export interface BrownfieldConfig {
  android: string;
  androidApp: string;
  androidManifest: string;
  ios: string;
}

interface IntegrateArgs {
  platform: 'android' | 'ios';
  version?: string;
  npm?: boolean;
}

async function resolveGitignore(root: string) {
  const gitignorePath = path.join(root, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.createFileSync(gitignorePath);
  }
  const gitignoreContent = fs.readFileSync(gitignorePath, {encoding: 'utf-8'});

  if (!gitignoreContent.includes('node_modules')) {
    fs.writeFileSync(gitignorePath, `${gitignoreContent}\nnode_modules`, {
      encoding: 'utf-8',
    });
  }
}

async function initPods(root: string, customIosPath?: string) {
  const iosPath = customIosPath || path.join(root, 'ios');
  const podfilePath = path.join(iosPath, 'Podfile');

  if (!fs.existsSync(podfilePath)) {
    try {
      process.chdir(iosPath);
      await execa('pod', ['init']);
      process.chdir(root);
    } catch {
      process.chdir(root);
      throw new CLIError('Failed to initialize Podfile');
    }
  }
}

async function getMinDeploymentTarget(root: string, customIosPath?: string) {
  const iosPath = customIosPath || path.join(root, 'ios');
  process.chdir(iosPath);

  try {
    const pbxFile = ConfigPlugins.IOSConfig.XcodeUtils.getPbxproj(root);
    const configurations = pbxFile.pbxXCBuildConfigurationSection();

    let minDeploymentTarget = '14.3';

    for (const {buildSettings} of Object.values(configurations || {})) {
      if (typeof buildSettings?.IPHONEOS_DEPLOYMENT_TARGET !== 'undefined') {
        minDeploymentTarget = buildSettings.IPHONEOS_DEPLOYMENT_TARGET;
      }
    }

    process.chdir(root);

    return minDeploymentTarget;
  } catch (error) {
    process.chdir(root);
    throw new CLIError('Failed to read iOS project dump');
  }
}

async function checkCocoapods(root: string, customIosPath?: string) {
  const iosPath = customIosPath || path.join(root, 'ios');
  process.chdir(iosPath);

  try {
    const {stdout} = await execa('pod', ['--version']);
    process.chdir(root);

    return stdout;
  } catch (error) {
    process.chdir(root);
    throw Error(
      'Cocoapods is not installed. Please install it first: https://cocoapods.org/',
    );
  }
}

async function copyPodfile(iosPath: string) {
  const content = `
  require_relative '../node_modules/react-native/scripts/react_native_pods'
  require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'
  
  def include_react_native
      config = use_native_modules!
      use_react_native!(
      :path => config[:reactNativePath],
      # An absolute path to your application root.
      :app_path => "#{Pod::Config.instance.installation_root}/.."
      )
  end`;
  const destinationPath = path.join(iosPath, 'include_react_native.rb');

  fs.writeFileSync(destinationPath, content, {encoding: 'utf-8'});
}

async function resolvePackageJson(root: string, args: IntegrateArgs) {
  if (!fs.existsSync(path.join(root, 'package.json'))) {
    fs.createFileSync(path.join(root, 'package.json'));
  }

  const appName = path.basename(root);

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(
      {
        name: appName,
        version: '0.0.1',
        private: true,
        scripts: {
          start: `${args.npm ? 'npm run' : 'yarn'} react-native start`,
        },
      },
      null,
      4,
    ),
    {encoding: 'utf-8'},
  );
}

async function addDependencies(root: string, args: IntegrateArgs, loader: Ora) {
  if (!fs.existsSync(path.join(root, 'package.json'))) {
    throw new CLIError(
      'No package.json found. Are you sure this is a React Native project?',
    );
  }

  loader.start();

  try {
    await execa(args.npm ? 'npm' : 'yarn', [
      args.npm ? 'install' : 'add',
      args.version ? `react-native@^${args.version}.0` : 'react-native',
    ]);
    const {stdout} = await execa(args.npm ? 'npm' : 'yarn', [
      args.npm ? 'view' : 'info',
      'react-native',
      'peerDependencies',
      '--json',
    ]);
    const peerDependencies = args.npm
      ? JSON.parse(stdout)
      : JSON.parse(stdout).data;
    const peerDependenciesArray = Object.entries(peerDependencies).map(
      ([pkg, version]) => `${pkg}@${version}`,
    );
    await execa(args.npm ? 'npm' : 'yarn', [
      args.npm ? 'install' : 'add',
      ...peerDependenciesArray,
    ]);
    loader.succeed();
  } catch {
    loader.fail();
    throw new CLIError(
      'Unable to add required dependencies to package.json. Please try adding it manually.',
    );
  }
}

async function promptPlatformSelection() {
  const {platform} = await prompts({
    type: 'select',
    name: 'platform',
    message: 'Select platform you want to integrate with React Native',
    choices: [
      {
        title: 'Android',
        value: 'android',
      },
      {
        title: 'iOS',
        value: 'ios',
      },
    ],
  });

  return platform;
}

function compareDeploymentTargets(
  appMajorVersion: string,
  rnMajorVersion: string,
) {
  if (
    semver.major(semver.coerce(appMajorVersion)) <
    semver.major(semver.coerce(rnMajorVersion))
  ) {
    throw new Error(
      `iOS deployment target version is ${appMajorVersion} and it should be minimum ${rnMajorVersion}. Please upgrade your iOS version before continuing.`,
    );
  }
}

async function getAndroidCompileSdkVersion(androidAppPath: string) {
  const appBuildGradlePath = path.join(androidAppPath, 'build.gradle');
  if (!fs.existsSync(appBuildGradlePath)) {
    throw new Error('app-level build.gradle file not found');
  }

  const buildGradle = await g2js.parseFile(appBuildGradlePath);
  return buildGradle.android.compileSdkVersion;
}

function getMinimumSupportedVersion(minDeploymentTarget: string) {
  for (const version of Object.keys(IOS_DEPLOYMENT_TARGETS_RN_VERSIONS)) {
    const v1 = semver.coerce(minDeploymentTarget) as SemVer;
    const v2 = semver.coerce(version) as SemVer;

    if (semver.compare(v1, v2) === 1) {
      return {...v2, original: version};
    }
  }

  return minDeploymentTarget;
}

async function promptForIosReactNativeVersion(
  minDeploymentTarget: keyof typeof IOS_DEPLOYMENT_TARGETS_RN_VERSIONS,
) {
  const {version} = await prompts({
    type: 'select',
    name: 'version',
    message: 'Select a React Native version compatible with your iOS project',
    choices: IOS_DEPLOYMENT_TARGETS_RN_VERSIONS[minDeploymentTarget].map(
      (v) => ({
        title: v,
        value: v,
      }),
    ),
  });

  return version;
}

async function promptForAndroidReactNativeVersion(
  minDeploymentTarget: keyof typeof ANDROID_COMPILE_SDK_VERSIONS,
) {
  const {version} = await prompts({
    type: 'select',
    name: 'version',
    message:
      'Select a React Native version compatible with your Android project',
    choices: ANDROID_COMPILE_SDK_VERSIONS[minDeploymentTarget].map((v) => ({
      title: v,
      value: v,
    })),
  });

  return version;
}

async function getBrownfieldConfig(
  projectRoot: string,
): Promise<Partial<BrownfieldConfig>> {
  const brownfieldConfigFile = path.join(projectRoot, 'brownfield.json');

  const defaultConfig = {
    android: path.join(projectRoot, 'android'),
    androidApp: path.join(projectRoot, 'android', 'app'),
    androidManifest: path.join(
      projectRoot,
      'android',
      'app',
      'src',
      'main',
      'AndroidManifest.xml',
    ),
    ios: path.join(projectRoot, 'ios'),
  };

  if (fs.existsSync(brownfieldConfigFile)) {
    logger.info('Found brownfield config file');
    const brownfieldConfig = fs.readFileSync(brownfieldConfigFile, {
      encoding: 'utf-8',
    });

    const parsedConfig = JSON.parse(brownfieldConfig);
    const config = defaultConfig;

    Object.keys(parsedConfig).forEach(
      (key) => (config[key] = path.join(projectRoot, parsedConfig[key])),
    );

    return config;
  }

  return defaultConfig;
}

async function integrate(_: Array<string>, ctx: Config, args: IntegrateArgs) {
  if (ctx) {
    throw new CLIError('This command can only be run outside of a project.');
  }

  if (!args.platform) {
    throw new CLIError('Please specify a platform to integrate with.');
  }

  const projectRoot = process.cwd();
  const loader = getLoader();

  let platform: 'android' | 'ios';

  if (typeof args.platform !== 'string') {
    platform = await promptPlatformSelection();
  } else {
    platform = args.platform;
  }

  const platformPath = path.join(projectRoot, platform);

  if (!fs.existsSync(platformPath)) {
    throw new CLIError(
      `Platform ${platform} does not exist. Please copy your existing native code to ${platformPath} first.`,
    );
  }

  let rnVersion: string | undefined;
  const brownfieldConfig = await getBrownfieldConfig(projectRoot);
  console.log(brownfieldConfig);

  if (args.platform === 'android') {
    const compileSdkVersion = await getAndroidCompileSdkVersion(
      brownfieldConfig.androidApp,
    );
    if (
      !Object.keys(ANDROID_COMPILE_SDK_VERSIONS).includes(compileSdkVersion)
    ) {
      throw new CLIError(
        'Your compile SDK version is not supported. Please upgrade your Android version before continuing.',
      );
    } else if (ANDROID_COMPILE_SDK_VERSIONS[compileSdkVersion].length === 1) {
      rnVersion = ANDROID_COMPILE_SDK_VERSIONS[compileSdkVersion][0];
    } else {
      rnVersion = await promptForAndroidReactNativeVersion(compileSdkVersion);
    }
  }

  if (args.platform === 'ios') {
    loader.start('Checking cocoapods version...');
    const cocoapodsVersion = await checkCocoapods(
      projectRoot,
      brownfieldConfig.ios,
    );
    loader.succeed(`Found CocoaPods version: ${cocoapodsVersion}`);

    loader.start('Checking iOS deployment target...');
    const minDeploymentTarget = await getMinDeploymentTarget(projectRoot);
    const minSupportedRnTarget = getMinimumSupportedVersion(
      minDeploymentTarget,
    );
    compareDeploymentTargets(
      minDeploymentTarget,
      MIN_SUPPORTED_IOS_DEPLOYMENT_TARGET,
    );
    if (
      IOS_DEPLOYMENT_TARGETS_RN_VERSIONS[minSupportedRnTarget.original]
        .length === 1
    ) {
      loader.succeed(
        `Your deployment target is ${minDeploymentTarget}. There is only one React Native version compatible with your target: ${
          IOS_DEPLOYMENT_TARGETS_RN_VERSIONS[minSupportedRnTarget.original][0]
        }.`,
      );
      rnVersion =
        IOS_DEPLOYMENT_TARGETS_RN_VERSIONS[minSupportedRnTarget.original][0];
    } else {
      rnVersion = await promptForIosReactNativeVersion(
        minSupportedRnTarget.original,
      );
    }
  }

  if (loader.isSpinning) {
    loader.succeed();
  }

  loader.start('Adding required dependencies...');
  await resolvePackageJson(projectRoot, args);
  await addDependencies(projectRoot, {...args, version: rnVersion}, loader);
  await resolveGitignore(projectRoot);
  loader.succeed();

  if (platform === 'ios') {
    await initPods(projectRoot);
    await copyPodfile(brownfieldConfig.ios);
  }

  await applyPlugins(projectRoot, platform, loader, rnVersion);
  copyEntryFiles(projectRoot);
}

export default {
  name: 'integrate',
  description: 'Integrate React Native into existing app',
  func: integrate,
  options: [
    {
      name: '--platform [string]',
      description: 'Platform you want to integrate with React Native',
    },
    {
      name: '--version [string]',
      description: 'Version of React Native to install',
    },
    {
      name: '--npm',
      description: 'Whether to use npm or Yarn (default)',
      default: false,
    },
  ],
};
