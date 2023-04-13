import loadConfig from '@react-native-community/cli-config';
import {getConfig} from '@expo/config';
import {compileModsAsync} from '@expo/config-plugins';
import {withAndroidPlugins, withIosPlugins} from '../utils/defaultPlugins';

export default async function applyPlugins() {
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
    platforms: ['android', 'ios'],
    assertMissingModProviders: false,
  });
}
