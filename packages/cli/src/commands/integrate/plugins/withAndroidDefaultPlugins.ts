import {
  ConfigPlugins,
  Plugins,
} from '@react-native-community/cli-config-plugins';
import withCustomAndroidManifest from './custom/withCustomAndroidManifest';

interface AndroidDefaultPluginsProps {
  isJscEnabled?: boolean;
  manifestPath?: string;
}

export const withAndroidDefaultPlugins: ConfigPlugins.ConfigPlugin<AndroidDefaultPluginsProps> = (
  config,
  {isJscEnabled, manifestPath},
) => {
  return ConfigPlugins.withPlugins(
    config,
    isJscEnabled
      ? [
          Plugins.withJscReactPlugin,
          Plugins.withAutolinking,
          [withCustomAndroidManifest, {manifestPath}],
        ]
      : [
          Plugins.withReactPlugin,
          Plugins.withReactNativeGradlePlugin,
          Plugins.withAutolinking,
          [withCustomAndroidManifest, {manifestPath}],
        ],
  );
};
