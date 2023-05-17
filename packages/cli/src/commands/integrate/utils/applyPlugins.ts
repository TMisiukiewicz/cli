import {Ora} from 'ora';
import {
  compileModsAsync,
  getConfig,
} from '@react-native-community/cli-config-plugins';
import {CLIError} from '@react-native-community/cli-tools';
import {withAndroidDefaultPlugins} from '../plugins/withDefaultPlugins';

const applyPlugins = async (path: string, loader: Ora) => {
  loader.start('Applying platform-specific modifications...');
  try {
    let {exp: config} = getConfig(path, {
      skipSDKVersionRequirement: true,
      isModdedConfig: true,
    });

    config = withAndroidDefaultPlugins(config);

    await compileModsAsync(config, {
      projectRoot: path,
      platforms: ['android'],
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
