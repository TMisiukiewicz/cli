import path from 'path';
import fs from 'fs-extra';
import {createHash} from 'crypto';
import {CLIError} from '@react-native-community/cli-tools';

type CachedConfigKeys =
  | 'appJson'
  | 'appName'
  | 'dependencies'
  | 'devDependencies';

type ReactNativeCachedFile = {[key in CachedConfigKeys]: string};

export const createReactNativeFolder = (projectRoot: string) => {
  try {
    fs.mkdir(path.join(projectRoot, '.react-native'));
    fs.createFileSync(path.join(projectRoot, '.react-native', 'cached.json'));

    fs.writeFileSync(
      path.join(projectRoot, '.react-native', 'cached.json'),
      '{}',
      {encoding: 'utf8'},
    );
  } catch {
    throw new CLIError('Failed to create .react-native folder.');
  }
};

export const getCachedConfig = (projectRoot: string) => {
  const cachedFilePath = path.join(projectRoot, '.react-native', 'cached.json');
  try {
    const config = fs.readJsonSync(cachedFilePath, {encoding: 'utf8'});

    return config;
  } catch {
    throw new CLIError('Failed to read cached config.');
  }
};

export const generateFileHash = (filePath: string) => {
  try {
    const file = fs.readFileSync(filePath, {encoding: 'utf8'});
    const hash = createHash('sha1').update(file).digest('hex');

    return hash;
  } catch {
    throw new CLIError('Failed to generate file hash.');
  }
};

export const updateCachedConfig = (
  projectRoot: string,
  key: CachedConfigKeys,
  value: string,
) => {
  const cachedFilePath = path.join(projectRoot, '.react-native', 'cached.json');
  try {
    const cache = getCachedConfig(projectRoot);
    cache[key] = value;

    fs.writeJsonSync(cachedFilePath, cache, {encoding: 'utf8'});
  } catch {
    throw new CLIError('Failed to update cached config.');
  }
};

export const getCacheFile = (projectRoot: string): ReactNativeCachedFile => {
  try {
    const cachedFilePath = path.join(
      projectRoot,
      '.react-native',
      'cached.json',
    );

    return fs.readJsonSync(cachedFilePath, {encoding: 'utf8'});
  } catch {
    throw new CLIError('Failed to read cached config.');
  }
};

export const updateMultipleCachedKeys = (
  cache: ReactNativeCachedFile,
  values: Partial<ReactNativeCachedFile>,
) => ({...cache, ...values});

export const saveCacheFile = (
  projectRoot: string,
  cache: ReactNativeCachedFile,
) => {
  try {
    const cachedFilePath = path.join(
      projectRoot,
      '.react-native',
      'cached.json',
    );

    fs.writeJsonSync(cachedFilePath, cache, {encoding: 'utf8'});
  } catch {
    throw new CLIError('Failed to update cached config.');
  }
};
