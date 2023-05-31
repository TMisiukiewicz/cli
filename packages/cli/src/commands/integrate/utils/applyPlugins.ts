import {Ora} from 'ora';
import {
  ConfigPlugins,
  getConfig,
} from '@react-native-community/cli-config-plugins';
import {CLIError} from '@react-native-community/cli-tools';
import semver from 'semver';
import {withAndroidDefaultPlugins} from '../plugins/withAndroidDefaultPlugins';
import {withIosDefaultPlugins} from '../plugins/withIosDefaultPlugins';

interface PluginsConfig {
  rnVersion: string;
  manifestPath: string;
}

const applyPlugins = async (
  path: string,
  platform: 'android' | 'ios',
  loader: Ora,
  {rnVersion, ...rest}: PluginsConfig,
) => {
  loader.start('Applying platform-specific modifications...');
  try {
    let {exp: config} = getConfig(path, {
      skipSDKVersionRequirement: true,
      isModdedConfig: true,
    });

    config = withAndroidDefaultPlugins(config, {
      isJscEnabled: semver.minor(`${rnVersion}.0`) < 71,
      manifestPath: rest.manifestPath,
    });
    config = withIosDefaultPlugins(config);

    await ConfigPlugins.compileModsAsync(config, {
      projectRoot: path,
      platforms: [platform],
      assertMissingModProviders: false,
    });
    loader.succeed();
  } catch {
    loader.fail();
    throw new CLIError(
      'Failed to apply platform-specific modifications. Please try to modify the project manually.',
    );
  }
};

export default applyPlugins;
