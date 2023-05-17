import {
  ConfigPlugin,
  // withProjectBuildGradle,
  withSettingsGradle,
} from '@expo/config-plugins';
// import g2js from 'gradle-to-js/lib/parser';

export const applyToGradleSettings = (
  settingsGradle: string,
  newLine: string,
) => {
  const lines = settingsGradle.split('\n');
  lines.push(newLine);

  const modifiedContent = lines.join('\n');

  return modifiedContent;
};

export const withReactNativeGradlePlugin: ConfigPlugin = (config) => {
  config = withSettingsGradle(config, (newConfig) => {
    newConfig.modResults.contents = applyToGradleSettings(
      newConfig.modResults.contents,
      "includeBuild('../node_modules/react-native-gradle-plugin')",
    );

    return newConfig;
  });

  // config = withProjectBuildGradle(config, async (newConfig) => {
  //   newConfig.modResults.contents = await applyToBuildGradle(
  //     newConfig.modResults.contents,
  //   );

  //   return newConfig;
  // });

  return config;
};
