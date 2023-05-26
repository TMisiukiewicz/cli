import {
  ConfigPlugins,
  Plugins,
} from '@react-native-community/cli-config-plugins';

interface AndroidDefaultPluginsProps {
  isJscEnabled?: boolean;
}

export const withAndroidDefaultPlugins: ConfigPlugins.ConfigPlugin<AndroidDefaultPluginsProps> = (
  config,
  {isJscEnabled},
) => {
  return ConfigPlugins.withPlugins(
    config,
    isJscEnabled
      ? [
          Plugins.withJscReactPlugin,
          Plugins.withAutolinking,
          Plugins.withDefaultBrownfieldPermissions,
          Plugins.withDevSettingsActivity,
        ]
      : [
          Plugins.withReactPlugin,
          Plugins.withReactNativeGradlePlugin,
          Plugins.withAutolinking,
          Plugins.withDefaultBrownfieldPermissions,
          Plugins.withDevSettingsActivity,
        ],
  );
};
