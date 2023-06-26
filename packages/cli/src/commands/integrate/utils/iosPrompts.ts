import prompts from 'prompts';
import {IOS_DEPLOYMENT_TARGETS_RN_VERSIONS} from '../consts';

export async function promptForIosReactNativeVersion(
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
