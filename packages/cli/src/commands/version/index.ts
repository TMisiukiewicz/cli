import path from 'path';
import fs from 'fs-extra';
import os from 'os';
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

async function version(args: Array<string>, ctx: Config) {
  const loader = getLoader({text: 'Checking template...'});
  loader.start();
  const cache = getCacheFile(ctx.root);
  const appJson: AppJSONConfig = fs.readJSONSync(
    path.join(ctx.root, 'app.json'),
    {
      encoding: 'utf8',
    },
  );
  const iosPath = path.join(ctx.root, 'ios');

  if (fs.existsSync(iosPath)) {
    try {
      const templateTempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'rncli-version-template-'),
      );
      const templateSrcDir = path.join(
        ctx.root,
        'node_modules',
        'react-native',
        'template',
      );

      copyTemplateFiles(templateSrcDir, templateTempDir, ['ios']);

      await overwritePlaceholders(
        'ios',
        cache.appName as string,
        appJson.name,
        templateTempDir,
      );

      await applyPlugins(['ios'], templateTempDir);

      const sha1CurrentFolder = await sha1HashFolderRecursive(iosPath);
      const sha1TemplateFolder = await sha1HashFolderRecursive(
        path.join(templateTempDir, 'ios'),
      );

      const isIosEqual = compareHashes(sha1CurrentFolder, sha1TemplateFolder);

      if (!isIosEqual) {
        loader.fail(
          'Some manual changes in your ios folder were detected. Please revert them before running this command again.',
        );
      } else {
        loader.succeed();
      }
    } catch (error) {
      loader.fail();
      throw new CLIError('Failed to check template');
    }
  }
  loader.succeed();
  await upgrade(args, ctx);
}

const versionCommand = {
  name: 'version [version]',
  description: 'Switch version of React Native',
  func: version,
};

export default versionCommand;
