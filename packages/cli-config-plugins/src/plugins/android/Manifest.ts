import {AndroidConfig, ConfigPlugin} from '@expo/config-plugins';

export const withDefaultBrownfieldPermissions: ConfigPlugin = (config) => {
  return AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.INTERNET',
  ]);
};

export const withDevSettingsActivity: ConfigPlugin = (config) => {
  return config;
};
