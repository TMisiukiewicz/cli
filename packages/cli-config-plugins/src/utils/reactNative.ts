import path from 'path';
import fs from 'fs-extra';
import {CLIError} from '@react-native-community/cli-tools';

type CachedConfigKeys =
  | 'appJson'
  | 'appName'
  | 'dependencies'
  | 'devDependencies';

type ReactNativeCachedFile = {[key in CachedConfigKeys]: string};

export type CacheFile = Partial<ReactNativeCachedFile>;

export const createReactNativeFolder = (projectRoot: string) => {
  const filePath = path.join(projectRoot, '.react-native', 'cached.json');

  try {
    fs.mkdir(path.join(projectRoot, '.react-native'));
    fs.createFileSync(filePath);

    fs.writeFileSync(filePath, '{}', {encoding: 'utf8'});
  } catch {
    throw new CLIError('Failed to create .react-native folder.');
  }
};

export const getCachedConfig = (projectRoot: string): CacheFile => {
  const filePath = path.join(projectRoot, '.react-native', 'cached.json');

  try {
    const config = fs.readJsonSync(filePath, {encoding: 'utf8'});

    return config;
  } catch {
    throw new CLIError('Failed to read cached config.');
  }
};

export const getCacheFile = (projectRoot: string): CacheFile => {
  try {
    const filePath = path.join(projectRoot, '.react-native', 'cached.json');

    return fs.readJsonSync(filePath, {encoding: 'utf8'});
  } catch {
    throw new CLIError('Failed to read cached config.');
  }
};

export const updateMultipleCachedKeys = (
  cache: CacheFile,
  values: CacheFile,
) => ({...cache, ...values});

export const saveCacheFile = (projectRoot: string, cache: CacheFile) => {
  const filePath = path.join(projectRoot, '.react-native', 'cached.json');

  try {
    fs.writeJsonSync(filePath, cache, {encoding: 'utf8'});
  } catch {
    throw new CLIError('Failed to update cached config.');
  }
};
