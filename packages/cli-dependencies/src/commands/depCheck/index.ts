//@ts-nocheck
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

interface PackageJson {
  peerDependencies?: {[key: string]: string};
  dependencies?: {[key: string]: string};
  devDependencies?: {[key: string]: string};
}

function readPackageJson(dir: string): PackageJson | null {
  const filePath = path.join(dir, 'package.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

function getPeerDependencies(
  dir: string,
  collectedDeps = new Set<{name: string; parent: string}>(),
): Set<{name: string; parent: string}> {
  const packageJson = readPackageJson(dir);
  if (!packageJson) {
    return collectedDeps;
  }

  if (packageJson.peerDependencies) {
    Object.keys(packageJson.peerDependencies).forEach((dep) => {
      collectedDeps.add({
        name: dep,
        parent: packageJson.name,
      });
    });
  }

  const allDeps = {...packageJson.dependencies, ...packageJson.devDependencies};

  if (allDeps) {
    Object.keys(allDeps).forEach((dep) => {
      const depPath = path.join(dir, 'node_modules', dep);
      if (fs.existsSync(depPath)) {
        getPeerDependencies(depPath, collectedDeps);
      }
    });
  }

  return collectedDeps;
}

async function getFiles(packageName: string, version?: string): Promise<any> {
  let libVersion = version;

  if (!version) {
    libVersion = await getLatestVersion(packageName);
  }

  const npmFilesUrl = `https://www.npmjs.com/package/${packageName}/v/${libVersion}/index`;

  try {
    const response = await fetch(npmFilesUrl);
    if (response.status === 200) {
      const filesList = await response.json();
      return filesList;
    }
    throw new Error(
      `Could not find package ${packageName} with specified version ${version}. Make sure the name is correct and the version exists.`,
    );
  } catch (error) {
    console.error(error);
  }
}

async function getLatestVersion(packageName: string): Promise<string> {
  const npmRegistryUrl = `https://registry.npmjs.org/${packageName}`;
  try {
    const response = await fetch(npmRegistryUrl);
    if (response.status === 200) {
      const packageData = await response.json();
      return packageData['dist-tags'].latest;
    }
    throw new Error(`Could not retrieve the latest version for ${packageName}`);
  } catch (error) {
    console.error(error);
  }
}

const androidFiles = ['build.gradle', 'build.gradle.kts'];

function checkLocalFiles(depPath: string): boolean {
  const filesInDir = fs.readdirSync(depPath);

  return filesInDir.some(
    (file) => file.endsWith('.podspec') || androidFiles.includes(file),
  );
}

async function checkPeerDependencies(dir: string) {
  const packageJson = readPackageJson(dir);
  const peerDependencies = getPeerDependencies(dir);
  const missingDeps: Array<{name: string; parent: string}> = [];
  const additionalDeps: string[] = [];

  for (const dep of peerDependencies) {
    const depPath = path.join(dir, 'node_modules', dep.name);
    if (!fs.existsSync(depPath)) {
      const files = await getFiles(dep.name);
      if (files) {
        const fileNames = Object.keys(files.files);
        const hasNativeCode = fileNames.some(
          (file) => file.endsWith('.podspec') || androidFiles.includes(file),
        );

        if (hasNativeCode) {
          missingDeps.push(dep);
        }
      }
    }
  }

  // Check for peer dependencies in node_modules but not in dependencies/devDependencies
  const nodeModulesPath = path.join(dir, 'node_modules');
  const nodeModulesDeps = fs
    .readdirSync(nodeModulesPath)
    .filter((dep) => !dep.startsWith('.'));

  nodeModulesDeps.forEach((dep) => {
    const depPath = path.join(nodeModulesPath, dep);
    if (
      fs.lstatSync(depPath).isDirectory() &&
      !packageJson?.dependencies?.[dep] &&
      !packageJson?.devDependencies?.[dep]
    ) {
      if (checkLocalFiles(depPath)) {
        additionalDeps.push(dep);
      }
    }
  });

  return {missingDeps, additionalDeps};
}

// Usage example
const projectDir = process.cwd();
function depCheck() {
  checkPeerDependencies(projectDir).then(({missingDeps, additionalDeps}) => {
    if (missingDeps.length > 0) {
      console.log('Missing Peer Dependencies with special files:');
      missingDeps.forEach((dep) =>
        console.log(
          `${chalk.bold(dep.name)} (dependency of ${chalk.bold(dep.parent)})`,
        ),
      );
    } else {
      console.log('All peer dependencies are satisfied.');
    }

    if (additionalDeps.length > 0) {
      console.log(
        'Additional local dependencies with special files not listed in package.json:',
      );
      additionalDeps.forEach((dep) => console.log(dep));
    } else {
      console.log('No additional local dependencies with special files found.');
    }
  });
}

export default {
  func: depCheck,
  name: 'depcheck',
  description: '',
};
