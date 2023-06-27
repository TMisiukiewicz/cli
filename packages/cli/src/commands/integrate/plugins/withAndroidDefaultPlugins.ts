import {
  ConfigPlugins,
  Plugins,
} from '@react-native-community/cli-config-plugins';
import withCustomAndroidManifest from './custom/withCustomAndroidManifest';
import withNativeModules from './custom/withNativeModules';

interface AndroidDefaultPluginsProps {
  isJscEnabled?: boolean;
  manifestPath?: string;
  appLevelBuildGradlePath?: string;
}

export const withAndroidDefaultPlugins: ConfigPlugins.ConfigPlugin<AndroidDefaultPluginsProps> = (
  config,
  {isJscEnabled, manifestPath, appLevelBuildGradlePath},
) => {
  return ConfigPlugins.withPlugins(
    config,
    isJscEnabled
      ? [
          [Plugins.withJscReactPlugin, {appLevelBuildGradlePath}],
          [withNativeModules, {appLevelBuildGradlePath}],
          [withCustomAndroidManifest, {manifestPath}],
          Plugins.withAutolinking,
        ]
      : [
          [Plugins.withReactPlugin, {appLevelBuildGradlePath}],
          [withNativeModules, {appLevelBuildGradlePath}],
          [withCustomAndroidManifest, {manifestPath}],
          Plugins.withReactNativeGradlePlugin,
          Plugins.withAutolinking,
        ],
  );
};
