import {ConfigPlugins} from '@react-native-community/cli-config-plugins';
import fs from 'fs-extra';

export const applyToBuildGradle = (buildGradle: string, newLine: string) => {
  const lines = buildGradle.split('\n');
  lines.push(newLine);

  const modifiedContent = lines.join('\n');

  return modifiedContent;
};

const withNativeModules: ConfigPlugins.ConfigPlugin = (
  config,
  //@ts-ignore
  {appLevelBuildGradlePath},
) => {
  return ConfigPlugins.withDangerousMod(config, [
    'android',
    async (conf) => {
      const filePath =
        appLevelBuildGradlePath ||
        ConfigPlugins.AndroidConfig.Paths.getAppBuildGradleFilePath(
          conf.modRequest.projectRoot,
        );

      const appBuildGradle = ConfigPlugins.AndroidConfig.Paths.getFileInfo(
        filePath,
      );

      appBuildGradle.contents = applyToBuildGradle(
        appBuildGradle.contents,
        'apply from: file("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)',
      );

      fs.writeFileSync(filePath, appBuildGradle.contents, {encoding: 'utf-8'});

      return conf;
    },
  ]);
};

export default withNativeModules;
