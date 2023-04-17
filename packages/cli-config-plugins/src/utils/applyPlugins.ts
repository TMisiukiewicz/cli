import loadConfig from '@react-native-community/cli-config';
import {getConfig} from '@expo/config';
import {ModConfig, compileModsAsync} from '@expo/config-plugins';
import {withAndroidPlugins, withIosPlugins} from './defaultPlugins';

const applyPlugins = async (
  platforms: {ios: boolean; android: boolean} = {ios: true, android: true},
) => {
  const {root} = loadConfig();

  let {exp: config} = getConfig(root, {
    skipSDKVersionRequirement: true,
    isModdedConfig: true,
  });

  if (!config.ios) {
    config.ios = {};
  }
  config.ios.bundleIdentifier =
    config.ios.bundleIdentifier || `com.${config.name.toLowerCase()}`;

  // Add all built-in plugins
  config = withIosPlugins(config, {
    bundleIdentifier: config.ios.bundleIdentifier,
  });

  if (!config.android) {
    config.android = {};
  }
  config.android.package =
    config.android.package || `com.${config.name.toLowerCase()}`;
  // Add all built-in plugins
  config = withAndroidPlugins(config, {
    package: config.android.package,
  });

  await compileModsAsync(config, {
    projectRoot: root,
    platforms: Object.keys(platforms).filter(
      (platform) => platforms[platform as keyof ModConfig],
    ) as (keyof ModConfig)[],
    assertMissingModProviders: false,
  });
};

export default applyPlugins;
