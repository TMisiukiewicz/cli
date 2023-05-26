import {
  ConfigPlugin,
  withAppBuildGradle,
  withProjectBuildGradle,
} from '@expo/config-plugins';

export const withReactPlugin: ConfigPlugin = (config) => {
  config = withAppBuildGradle(config, (newConfig) => {
    const pluginsObjExists = newConfig.modResults.contents.includes(
      'plugins {',
    );
    const dependenciesExists = newConfig.modResults.contents.includes(
      'dependencies {',
    );

    if (pluginsObjExists) {
      newConfig.modResults.contents = newConfig.modResults.contents.replace(
        'plugins {',
        "plugins {\n\t'com.facebook.react'",
      );
    } else {
      newConfig.modResults.contents = newConfig.modResults.contents.replace(
        /^/,
        'apply plugin: "com.facebook.react"\n',
      );
    }

    if (dependenciesExists) {
      newConfig.modResults.contents = newConfig.modResults.contents.replace(
        'dependencies {',
        'dependencies {\n\timplementation "com.facebook.react:react-android"\n\timplementation "com.facebook.react:hermes-android"',
      );
    } else {
      newConfig.modResults.contents = newConfig.modResults.contents.replace(
        /[\r\n]+$/,
        `
        dependencies {
            implementation "com.facebook.react:react-android"
            implementation "com.facebook.react:hermes-android"
        }`,
      );
    }
    return newConfig;
  });

  return config;
};

export const withJscReactPlugin: ConfigPlugin = (config) => {
  config = withAppBuildGradle(config, (newConfig) => {
    const dependenciesExists = newConfig.modResults.contents.includes(
      'dependencies {',
    );

    if (dependenciesExists) {
      newConfig.modResults.contents = newConfig.modResults.contents.replace(
        'dependencies {',
        'dependencies {\n\timplementation "com.facebook.react:react-native:+"\n\timplementation "org.webkit:android-jsc:+"',
      );
    }

    return newConfig;
  });

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
