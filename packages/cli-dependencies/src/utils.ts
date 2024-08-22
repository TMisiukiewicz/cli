// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  peerDependencies?: {[key: string]: string};
  dependencies?: {[key: string]: string};
  devDependencies?: {[key: string]: string};
  peerDependenciesMeta?: {[key: string]: any};
}

export const BUILD_GRADLE_FILES = ['build.gradle', 'build.gradle.kts'];

function readPackageJson(dir: string): PackageJson | null {
  const filePath = path.join(dir, 'package.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

function checkIfFilesHasNativeCode(files: string[]) {
  return files.some(
    (file) => file.endsWith('.podspec') || BUILD_GRADLE_FILES.includes(file),
  );
}

function checkLocalFiles(depPath: string): boolean {
  const filesInDir = fs.readdirSync(depPath);

  return checkIfFilesHasNativeCode(filesInDir);
}

function getPackageJsonRequiredPeerDependencies(directory: string) {
  const packageJson = readPackageJson(directory);
  if (!packageJson) {
    throw new Error(`No package.json found in ${directory}`);
  }

  if (packageJson.peerDependencies) {
    const peerDeps = Object.keys(packageJson.peerDependencies);
    const peerDepsMeta = packageJson.peerDependenciesMeta || {};
    return peerDeps.reduce<string[]>((acc, dep) => {
      const meta = peerDepsMeta[dep] || {};
      if (!meta.optional) {
        acc.push(dep);
      }
      return acc;
    }, []);
  }

  return [];
}

function compareArrays(haystack: string[], needle: string[]) {
  const nonExistingElements = haystack.filter((dep) => !needle.includes(dep));
  return nonExistingElements;
}

async function getLatestLibraryVersion(packageName: string): Promise<string> {
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

async function listLibraryFiles(
  packageName: string,
  version?: string,
): Promise<any> {
  let libVersion = version;

  if (!version) {
    libVersion = await getLatestLibraryVersion(packageName);
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

function doesDependencyHaveNativeCode(
  packageName: string,
  version?: string,
): boolean {
  let libVersion = version;
  const dependencyPath = path.join(process.cwd(), 'node_modules', packageName);

  if (fs.existsSync(dependencyPath)) {
    return checkLocalFiles(dependencyPath);
  }

  if (!version) {
    libVersion = getLatestLibraryVersion(packageName);
  }

  const filesList = listLibraryFiles(packageName, libVersion);

  return checkIfFilesHasNativeCode(filesList);
}

export {
  readPackageJson,
  getPackageJsonRequiredPeerDependencies,
  compareArrays,
  getLatestLibraryVersion,
  listLibraryFiles,
  doesDependencyHaveNativeCode,
  checkLocalFiles,
};
