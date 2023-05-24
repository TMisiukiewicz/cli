import {Ora} from 'ora';
import {
  ConfigPlugins,
  getConfig,
} from '@react-native-community/cli-config-plugins';
import {CLIError} from '@react-native-community/cli-tools';
import {withAndroidDefaultPlugins} from '../plugins/withAndroidDefaultPlugins';
import {withIosDefaultPlugins} from '../plugins/withIosDefaultPlugins';

const applyPlugins = async (
  path: string,
  platform: 'android' | 'ios',
  loader: Ora,
) => {
  loader.start('Applying platform-specific modifications...');
  try {
    let {exp: config} = getConfig(path, {
      skipSDKVersionRequirement: true,
      isModdedConfig: true,
    });

    config = withAndroidDefaultPlugins(config);
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
