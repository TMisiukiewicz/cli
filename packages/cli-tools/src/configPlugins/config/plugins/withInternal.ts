import {ConfigPlugin} from '@expo/config-plugins';
import {ConfigFilePaths} from '../Config.types';

/**
 * Adds the _internal object.
 *
 * @param config
 * @param projectRoot
 */
export const withInternal: ConfigPlugin<
  {projectRoot: string; packageJsonPath?: string} & Partial<ConfigFilePaths>
> = (config, internals) => {
  if (!config._internal) {
    config._internal = {};
  }

  config._internal = {
    isDebug: false,
    ...config._internal,
    ...internals,
  };

  return config;
};
