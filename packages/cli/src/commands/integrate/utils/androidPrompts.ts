import prompts from 'prompts';
import {ANDROID_COMPILE_SDK_VERSIONS} from '../consts';

export async function promptForAndroidReactNativeVersion(
  minDeploymentTarget: keyof typeof ANDROID_COMPILE_SDK_VERSIONS,
): Promise<string> {
  const {version} = await prompts({
    type: 'select',
    name: 'version',
    message:
      'Select a React Native version compatible with your Android project',
    choices: [
      ...ANDROID_COMPILE_SDK_VERSIONS[minDeploymentTarget].map((v) => ({
        title: v,
        value: v,
      })),
      {
        title: 'other',
        value: 'other',
      },
    ],
  });

  return version;
}

export async function promptForAndroidAppPath(
  defaultValue: string,
): Promise<string> {
  const {path} = await prompts({
    type: 'text',
    name: 'path',
    message: 'Please enter the path to your app-level build.gradle file',
    initial: defaultValue,
  });

  return path;
}

export async function promptForAndroidManifestPath(
  defaultValue: string,
): Promise<string> {
  const {path} = await prompts({
    type: 'text',
    name: 'path',
    message: 'Please enter the path to your AndroidManifest.xml file',
    initial: defaultValue,
  });

  return path;
}

export async function promptForCustomReactNativeVersion(): Promise<string> {
  const {version} = await prompts({
    type: 'text',
    name: 'version',
    message: 'Please enter the React Native version you want to use',
  });

  return version;
}
