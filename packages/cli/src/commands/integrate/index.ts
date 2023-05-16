import {CLIError, getLoader} from '@react-native-community/cli-tools';
import {Config} from '@react-native-community/cli-types';
import path from 'path';
import prompts from 'prompts';
import fs from 'fs-extra';
import execa from 'execa';
import {Ora} from 'ora';

interface IntegrateArgs {
  platform: 'android' | 'ios';
  npm?: boolean;
}

async function resolveGitignore(root: string) {
  const gitignorePath = path.join(root, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.createFileSync(gitignorePath);
  }
  const gitignoreContent = fs.readFileSync(gitignorePath, {encoding: 'utf-8'});

  if (!gitignoreContent.includes('node_modules')) {
    fs.writeFileSync(gitignorePath, `${gitignoreContent}\nnode_modules`, {
      encoding: 'utf-8',
    });
  }
}

async function resolvePackageJson(root: string, args: IntegrateArgs) {
  if (!fs.existsSync(path.join(root, 'package.json'))) {
    fs.createFileSync(path.join(root, 'package.json'));
  }

  const appName = path.basename(root);

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(
      {
        name: appName,
        version: '0.0.1',
        private: true,
        scripts: {
          start: `${args.npm ? 'npm run' : 'yarn'} react-native start`,
        },
      },
      null,
      4,
    ),
    {encoding: 'utf-8'},
  );
}

async function addDependencies(root: string, args: IntegrateArgs, loader: Ora) {
  if (!fs.existsSync(path.join(root, 'package.json'))) {
    throw new CLIError(
      'No package.json found. Are you sure this is a React Native project?',
    );
  }

  loader.start();

  try {
    await execa(args.npm ? 'npm' : 'yarn', [
      args.npm ? 'install' : 'add',
      'react-native',
    ]);
    const {stdout} = await execa(args.npm ? 'npm' : 'yarn', [
      args.npm ? 'view' : 'info',
      'react-native',
      'peerDependencies',
      '--json',
    ]);
    const peerDependencies = args.npm
      ? JSON.parse(stdout)
      : JSON.parse(stdout).data;
    const peerDependenciesArray = Object.entries(peerDependencies).map(
      ([pkg, version]) => `${pkg}@${version}`,
    );
    await execa(args.npm ? 'npm' : 'yarn', [
      args.npm ? 'install' : 'add',
      ...peerDependenciesArray,
    ]);
    loader.succeed();
  } catch {
    loader.fail();
    throw new CLIError(
      'Unable to add required dependencies to package.json. Please try adding it manually.',
    );
  }
}

async function promptPlatformSelection() {
  const {platform} = await prompts({
    type: 'select',
    name: 'platform',
    message: 'Select platform you want to integrate with React Native',
    choices: [
      {
        title: 'Android',
        value: 'android',
      },
      {
        title: 'iOS',
        value: 'ios',
      },
    ],
  });

  return platform;
}

async function integrate(_: Array<string>, ctx: Config, args: IntegrateArgs) {
  if (ctx) {
    throw new CLIError('This command can only be run outside of a project.');
  }

  if (!args.platform) {
    throw new CLIError('Please specify a platform to integrate with.');
  }

  const loader = getLoader({text: 'Installing dependencies...'});
  const projectRoot = process.cwd();

  let platform: string;

  if (typeof args.platform !== 'string') {
    platform = await promptPlatformSelection();
  } else {
    platform = args.platform;
  }

  const platformPath = path.join(projectRoot, platform);

  if (!fs.existsSync(platformPath)) {
    throw new CLIError(
      `Platform ${platform} does not exist. Please copy your existing native code to ${platformPath} first.`,
    );
  }

  resolvePackageJson(projectRoot, args);
  addDependencies(projectRoot, args, loader);
  resolveGitignore(projectRoot);
}

export default {
  name: 'integrate',
  description: 'Integrate React Native into existing app',
  func: integrate,
  options: [
    {
      name: '--platform [string]',
      description: 'Platform you want to integrate with React Native',
    },
    {
      name: '--npm',
      description: 'Whether to use npm or Yarn (default)',
      default: false,
    },
  ],
};
