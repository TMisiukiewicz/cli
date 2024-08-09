import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  peerDependencies?: {[key: string]: string};
  dependencies?: {[key: string]: string};
  devDependencies?: {[key: string]: string};
  peerDependenciesMeta?: {[key: string]: any};
}

function readPackageJson(dir: string): PackageJson | null {
  const filePath = path.join(dir, 'package.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

function getPackageJsonRequiredPeerDependencies(directory: string) {
  console.log({directory});
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

export {readPackageJson, getPackageJsonRequiredPeerDependencies, compareArrays};
