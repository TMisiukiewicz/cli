import {ConfigPlugin, withInfoPlist} from '@expo/config-plugins';

export const withTransportSecurityException: ConfigPlugin = (config) => {
  return withInfoPlist(config, (newConfig) => {
    newConfig.modResults.NSAppTransportSecurity = {
      NSExceptionDomains: {
        localhost: {
          NSExceptionAllowsInsecureHTTPLoads: true,
        },
      },
    };

    return newConfig;
  });
};
