import {ConfigPlugin, withSettingsGradle} from '@expo/config-plugins';
import {applyToGradleSettings} from './ReactNativeGradlePlugin';

export const withAutolinking: ConfigPlugin = (config) => {
  config = withSettingsGradle(config, (newConfig) => {
    newConfig.modResults.contents = applyToGradleSettings(
      newConfig.modResults.contents,
      'apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)',
    );

    return newConfig;
  });

  return config;
};
