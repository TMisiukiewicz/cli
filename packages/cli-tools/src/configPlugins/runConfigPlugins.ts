import {
  ConfigPlugin,
  IOSConfig,
  withPlugins,
  AndroidConfig,
  compileModsAsync,
} from '@expo/config-plugins';
import loadConfig from '@react-native-community/cli-config';
import {getConfig} from './config/Config';

export const withIosPlugins: ConfigPlugin<{
  bundleIdentifier: string;
}> = (config, {bundleIdentifier}) => {
  // Set the bundle ID ahead of time.
  if (!config.ios) {
    config.ios = {};
  }
  config.ios.bundleIdentifier = bundleIdentifier;

  return withPlugins(config, [
    [IOSConfig.BundleIdentifier.withBundleIdentifier, {bundleIdentifier}],
    IOSConfig.Swift.withSwiftBridgingHeader,
    IOSConfig.Swift.withNoopSwiftFile,
    IOSConfig.Google.withGoogle,
    IOSConfig.Name.withDisplayName,
    IOSConfig.Name.withProductName,
    IOSConfig.Orientation.withOrientation,
    IOSConfig.RequiresFullScreen.withRequiresFullScreen,
    IOSConfig.Scheme.withScheme,
    IOSConfig.UsesNonExemptEncryption.withUsesNonExemptEncryption,
    IOSConfig.Version.withBuildNumber,
    IOSConfig.Version.withVersion,
    IOSConfig.Google.withGoogleServicesFile,
    IOSConfig.BuildProperties.withJsEnginePodfileProps,
    // Entitlements
    IOSConfig.Entitlements.withAssociatedDomains,
    // XcodeProject
    IOSConfig.DeviceFamily.withDeviceFamily,
    IOSConfig.Bitcode.withBitcode,
    IOSConfig.Locales.withLocales,
    // Dangerous
  ]);
};

const withAndroidPlugins: ConfigPlugin<{
  package: string;
}> = (config, props) => {
  if (!config.android) {
    config.android = {};
  }
  config.android.package = props.package;

  return withPlugins(config, [
    // gradle.properties
    AndroidConfig.BuildProperties.withJsEngineGradleProps,

    // settings.gradle
    AndroidConfig.Name.withNameSettingsGradle,

    // project build.gradle
    AndroidConfig.GoogleServices.withClassPath,

    // app/build.gradle
    AndroidConfig.Package.withPackageGradle,
    AndroidConfig.Version.withVersion,

    // AndroidManifest.xml
    AndroidConfig.Package.withPackageManifest,
    AndroidConfig.AllowBackup.withAllowBackup,
    AndroidConfig.WindowSoftInputMode.withWindowSoftInputMode,
    // Note: The withAndroidIntentFilters plugin must appear before the withScheme
    // plugin or withScheme will override the output of withAndroidIntentFilters.
    AndroidConfig.IntentFilters.withAndroidIntentFilters,
    AndroidConfig.Scheme.withScheme,
    AndroidConfig.Orientation.withOrientation,
    AndroidConfig.Permissions.withInternalBlockedPermissions,
    AndroidConfig.Permissions.withPermissions,

    // strings.xml
    AndroidConfig.Name.withName,

    // Modify colors.xml and styles.xml
    AndroidConfig.StatusBar.withStatusBar,
    AndroidConfig.PrimaryColor.withPrimaryColor,
    // If we renamed the package, we should also move it around and rename it in source files
    // Added last to ensure this plugin runs first. Out of tree solutions will mistakenly resolve the package incorrectly otherwise.
    AndroidConfig.Package.withPackageRefactor,
  ]);
};

export default async function runConfigPlugins({
  platforms,
  bundleIdentifier,
  packageName,
}: {
  platforms: ['android', 'ios'];
  bundleIdentifier?: string;
  packageName?: string;
}) {
  const originalConfig = loadConfig();
  let {exp: config} = getConfig(originalConfig.root);

  if (platforms.includes('ios')) {
    if (!config.ios) {
      config.ios = {};
    }
    config.ios.bundleIdentifier =
      bundleIdentifier ??
      config.ios.bundleIdentifier ??
      'com.placeholder.appid';

    // Add all built-in plugins
    config = withIosPlugins(config, {
      bundleIdentifier: config.ios.bundleIdentifier,
    });
  }

  if (platforms.includes('android')) {
    if (!config.android) {
      config.android = {};
    }
    config.android.package =
      packageName ?? config.android.package ?? 'com.placeholder.appid';
    // Add all built-in plugins
    config = withAndroidPlugins(config, {
      package: config.android.package,
    });
  }
  await compileModsAsync(config, {
    projectRoot: originalConfig.root,
    platforms,
    assertMissingModProviders: false,
  });
}
