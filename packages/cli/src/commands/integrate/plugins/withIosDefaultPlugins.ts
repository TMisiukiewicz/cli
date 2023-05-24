import {
  ConfigPlugins,
  Plugins,
} from '@react-native-community/cli-config-plugins';

export const withIosDefaultPlugins: ConfigPlugins.ConfigPlugin = (config) =>
  ConfigPlugins.withPlugins(config, [Plugins.withTransportSecurityException]);
