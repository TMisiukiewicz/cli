import {
  AndroidConfig,
  ConfigPlugin,
  IOSConfig,
  withPlugins,
} from '@expo/config-plugins';

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
    // Entitlements
    IOSConfig.Entitlements.withAssociatedDomains,
    // XcodeProject
    IOSConfig.DeviceFamily.withDeviceFamily,
    IOSConfig.Bitcode.withBitcode,
    IOSConfig.Locales.withLocales,
  ]);
};

export const withAndroidPlugins: ConfigPlugin<{
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
    // If we renamed the package, we should also move it around and rename it in source files
    // Added last to ensure this plugin runs first. Out of tree solutions will mistakenly resolve the package incorrectly otherwise.
    AndroidConfig.Package.withPackageRefactor,
  ]);
};
