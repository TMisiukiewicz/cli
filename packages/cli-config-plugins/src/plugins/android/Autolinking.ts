import {
  ConfigPlugin,
  withAppBuildGradle,
  withSettingsGradle,
} from '@expo/config-plugins';
import {applyToGradleSettings} from './ReactNativeGradlePlugin';

export const withAutolinking: ConfigPlugin = (config) => {
  config = withSettingsGradle(config, (newConfig) => {
    newConfig.modResults.contents = applyToGradleSettings(
      newConfig.modResults.contents,
      'apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)',
    );

    return newConfig;
  });

  config = withAppBuildGradle(config, (newConfig) => {
    newConfig.modResults.contents = applyToGradleSettings(
      newConfig.modResults.contents,
      'apply from: file("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)',
    );

    return newConfig;
  });

  return config;
};
