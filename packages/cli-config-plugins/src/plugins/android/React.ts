import {
  AndroidConfig,
  ConfigPlugin,
  withDangerousMod,
  withProjectBuildGradle,
} from '@expo/config-plugins';
import fs from 'fs-extra';

interface AndroidDefaultPluginsProps {
  appLevelBuildGradlePath: string;
}

export const withReactPlugin: ConfigPlugin<AndroidDefaultPluginsProps> = (
  config,
  {appLevelBuildGradlePath},
) => {
  config = withDangerousMod(config, [
    'android',
    async (conf) => {
      const filePath =
        appLevelBuildGradlePath ||
        AndroidConfig.Paths.getAppBuildGradleFilePath(
          conf.modRequest.projectRoot,
        );

      const appBuildGradle = AndroidConfig.Paths.getFileInfo(filePath);
      const pluginsObjExists = appBuildGradle.contents.includes('plugins {');
      const dependenciesExists = appBuildGradle.contents.includes(
        'dependencies {',
      );

      if (pluginsObjExists) {
        //@ts-ignore
        appBuildGradle.contents = appBuildGradle.contents.replace(
          'plugins {',
          "plugins {\n\tid 'com.facebook.react'",
        );
      } else {
        appBuildGradle.contents = appBuildGradle.contents.replace(
          /^/,
          'apply plugin: "com.facebook.react"\n',
        );
      }

      if (dependenciesExists) {
        appBuildGradle.contents = appBuildGradle.contents.replace(
          'dependencies {',
          'dependencies {\n\timplementation "com.facebook.react:react-android"\n\timplementation "com.facebook.react:hermes-android"',
        );
      } else {
        appBuildGradle.contents = appBuildGradle.contents.replace(
          /[\r\n]+$/,
          `
            dependencies {
                implementation "com.facebook.react:react-android"
                implementation "com.facebook.react:hermes-android"
            }`,
        );
      }

      fs.writeFileSync(filePath, appBuildGradle.contents, {encoding: 'utf-8'});

      return conf;
    },
  ]);

  return config;
};

export const withJscReactPlugin: ConfigPlugin<AndroidDefaultPluginsProps> = (
  config,
  {appLevelBuildGradlePath},
) => {
  config = withDangerousMod(config, [
    'android',
    async (conf) => {
      const filePath =
        appLevelBuildGradlePath ||
        AndroidConfig.Paths.getAppBuildGradleFilePath(
          conf.modRequest.projectRoot,
        );

      const appBuildGradle = AndroidConfig.Paths.getFileInfo(filePath);

      const dependenciesExists = appBuildGradle.contents.includes(
        'dependencies {',
      );

      if (dependenciesExists) {
        appBuildGradle.contents = appBuildGradle.contents.replace(
          'dependencies {',
          'dependencies {\n\timplementation "com.facebook.react:react-native:+"\n\timplementation "org.webkit:android-jsc:+"',
        );
      }

      fs.writeFileSync(filePath, appBuildGradle.contents, {encoding: 'utf-8'});

      return conf;
    },
  ]);

  config = withProjectBuildGradle(config, (newConfig) => {
    const pattern = /allprojects\s*\{[\t\n\r\s]*repositories\s*\{/s;
    const allProjectsExists = pattern.test(newConfig.modResults.contents);

    if (allProjectsExists) {
      newConfig.modResults.contents = newConfig.modResults.contents.replace(
        pattern,
        'allprojects  {\n\trepositories {\nmaven { url "$rootDir/../node_modules/react-native/android" }\nmaven { url("$rootDir/../node_modules/jsc-android/dist") }',
      );
    }
    return newConfig;
  });

  return config;
};
