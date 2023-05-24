import {
  ConfigPlugins,
  Plugins,
} from '@react-native-community/cli-config-plugins';

export const withAndroidDefaultPlugins: ConfigPlugins.ConfigPlugin = (config) =>
  ConfigPlugins.withPlugins(config, [
    Plugins.withReactPlugin,
    Plugins.withReactNativeGradlePlugin,
    Plugins.withAutolinking,
    Plugins.withDefaultBrownfieldPermissions,
    Plugins.withDevSettingsActivity,
  ]);
