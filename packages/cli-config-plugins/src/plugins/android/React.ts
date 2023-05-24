import {ConfigPlugin, withAppBuildGradle} from '@expo/config-plugins';

export const withReactPlugin: ConfigPlugin = (config) => {
  config = withAppBuildGradle(config, (newConfig) => {
    const pluginsObjExists = newConfig.modResults.contents.includes(
      'plugins {',
    );
    const dependenciesExists = newConfig.modResults.contents.includes(
      'dependencies {',
    );
    console.log({pluginsObjExists, dependenciesExists});
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
