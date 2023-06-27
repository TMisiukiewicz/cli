import {
  ConfigPlugin,
  withProjectBuildGradle,
  withSettingsGradle,
} from '@expo/config-plugins';

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

  config = withProjectBuildGradle(config, async (newConfig) => {
    const buildscriptExists = newConfig.modResults.contents.includes(
      'buildscript {',
    );
    const dependenciesExist = newConfig.modResults.contents.includes(
      'dependencies {',
    );

    if (buildscriptExists) {
      if (dependenciesExist) {
        newConfig.modResults.contents = newConfig.modResults.contents.replace(
          'dependencies {',
          'dependencies {\n\t\tclasspath("com.facebook.react:react-native-gradle-plugin")',
        );
      } else {
        newConfig.modResults.contents = newConfig.modResults.contents.replace(
          'buildscript {',
          'buildscript {\n\tdependencies {\n\t\tclasspath("com.facebook.react:react-native-gradle-plugin")\n}',
        );
      }
    } else {
      newConfig.modResults.contents = newConfig.modResults.contents.replace(
        /^/,
        'buildscript {\n\tdependencies {\n\t\tclasspath("com.facebook.react:react-native-gradle-plugin")\n}\n}',
      );
    }

    return newConfig;
  });

  return config;
};
