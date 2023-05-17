import {
  ConfigPlugin,
  withPlugins,
} from '@react-native-community/cli-config-plugins';
import {Plugins} from '@react-native-community/cli-config-plugins';

export const withAndroidDefaultPlugins: ConfigPlugin = (config) =>
  withPlugins(config, [
    Plugins.withReactNativeGradlePlugin,
    Plugins.withAutolinking,
    Plugins.withDefaultBrownfieldPermissions,
    Plugins.withDevSettingsActivity,
  ]);
