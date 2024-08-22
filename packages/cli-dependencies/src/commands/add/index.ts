import {logger, getLoader} from '@react-native-community/cli-tools';
import chalk from 'chalk';
import prompts from 'prompts';
import execa from 'execa';
import {
  compareArrays,
  getPackageJsonRequiredPeerDependencies,
  readPackageJson,
} from '../../utils';

async function add([packageName]: Array<string>) {
  let packageToInstall = packageName;

  if (!packageName) {
    const {name} = await prompts({
      type: 'text',
      name: 'name',
      message:
        'Package name is required. Please provide a package name you want to install.',
    });

    packageToInstall = name;
  }

  if (!packageToInstall) {
    logger.error(
      `Package name was not provided. Please run ${chalk.bold(
        `npx rnc-cli add ${chalk.red('[package-name]')}`,
      )}.`,
    );
  }

  const loader = getLoader();
  loader.start(`Installing ${chalk.bold(packageToInstall)}...`);
  // TODO: add check for package manager, for now let's test it purely with Yarn
  // TODO: switch to cli-package-manager once merged into codebase
  // TODO: handle non-existing packages
  try {
    await execa('yarn', ['add', packageToInstall], {
      stdio: 'pipe',
    });
    loader.succeed(`Installed ${chalk.bold(packageToInstall)}`);
  } catch {
    loader.fail();
  }

  const verifyDependencyLoader = getLoader();

  verifyDependencyLoader.start('Verifying dependency...');
  const requiredPeerDependencies = getPackageJsonRequiredPeerDependencies(
    `${process.cwd()}/node_modules/${packageToInstall}`,
  );
  const packageJson = readPackageJson(process.cwd());

  const requiredPeersToInstall = compareArrays(requiredPeerDependencies, [
    ...Object.keys(packageJson?.dependencies || []),
    ...Object.keys(packageJson?.devDependencies || []),
  ]);

  verifyDependencyLoader.succeed();
  if (requiredPeersToInstall.length > 0) {
    const {installPeers} = await prompts({
      type: 'confirm',
      name: 'installPeers',
      message: `Found peer dependencies required by the package: ${requiredPeersToInstall.join(
        ', ',
      )}. Do you want to install them now and add them to your package.json?`,
    });

    if (installPeers) {
      const peersInstallLoader = getLoader();
      peersInstallLoader.start('Installing peer dependencies...');
      try {
        await execa('yarn', ['add', ...requiredPeersToInstall], {
          stdio: 'pipe',
        });
        peersInstallLoader.succeed('Installed peer dependencies');
      } catch {
        peersInstallLoader.fail();
      }
    } else {
      logger.warn(
        `Peer dependencies were not installed. Please install them manually using ${chalk.bold(
          `yarn add ${requiredPeersToInstall.join(' ')}`,
        )}.`,
      );
    }
  }
}

export default {
  func: add,
  name: 'add [packageName]',
  description: '',
};
