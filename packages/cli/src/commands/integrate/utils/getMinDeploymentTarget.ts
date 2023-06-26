import {ConfigPlugins} from '@react-native-community/cli-config-plugins';
import {CLIError} from '@react-native-community/cli-tools';
import path from 'path';

export default async function getMinDeploymentTarget(root: string) {
  const iosPath = path.join(root, 'ios');
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
