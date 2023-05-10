import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import {Ora} from 'ora';
import {Config} from '@react-native-community/cli-types';
import {
  compareHashes,
  sha1HashFolderRecursive,
} from '../../tools/compareTemplates';
import {CLIError, getLoader} from '@react-native-community/cli-tools';
import {
  AppJSONConfig,
  applyPlugins,
  copyTemplateFiles,
  getCacheFile,
  overwritePlaceholders,
} from '@react-native-community/cli-config-plugins';
import {upgrade} from '../upgrade/upgrade';

async function generatePlatformSha1(
  platform: 'android' | 'ios',
  rootPath: string,
  params: {
    cachedName: string;
    appName: string;
  },
  loader: Ora,
) {
  loader.start(`Checking ${platform} folder...`);
  const platformPath = path.join(rootPath, platform);

  if (fs.existsSync(platformPath)) {
    try {
      const templateTempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'rncli-version-template-'),
      );
      const templateSrcDir = path.join(
        rootPath,
        'node_modules',
        'react-native',
        'template',
      );

      copyTemplateFiles(templateSrcDir, templateTempDir, [platform]);

      await overwritePlaceholders(
        platform,
        params.cachedName,
        params.appName,
        templateTempDir,
      );

      await applyPlugins([platform], templateTempDir);

      const sha1CurrentFolder = await sha1HashFolderRecursive(platformPath);
      const sha1TemplateFolder = await sha1HashFolderRecursive(
        path.join(templateTempDir, platform),
      );
      const arePlatformTemplatesEqual = compareHashes(
        sha1CurrentFolder,
        sha1TemplateFolder,
      );

      if (!arePlatformTemplatesEqual) {
        throw new Error(
          `Some manual changes in your ${platform} folder were detected. Please review this changes and use upgrade helper instead.`,
        );
      } else {
        loader.succeed();
      }
    } catch (error) {
      loader.fail();
      throw new CLIError((error as Error).message);
    }
  }
  loader.succeed();
}

async function version(args: Array<string>, ctx: Config) {
  const cache = getCacheFile(ctx.root);
  const appJson: AppJSONConfig = fs.readJSONSync(
    path.join(ctx.root, 'app.json'),
    {
      encoding: 'utf8',
    },
  );
  const loader: Ora = getLoader();
  await generatePlatformSha1(
    'ios',
    ctx.root,
    {
      cachedName: cache.appName as string,
      appName: appJson.name,
    },
    loader,
  );
  await generatePlatformSha1(
    'android',
    ctx.root,
    {
      cachedName: cache.appName as string,
      appName: appJson.name,
    },
    loader,
  );

  await upgrade(args, ctx);
}

const versionCommand = {
  name: 'version [version]',
  description: 'Switch version of React Native',
  func: version,
};

export default versionCommand;
