import {PackageJSONConfig} from '@expo/config';
import createFileHash from './createFileHash';

export type DependenciesMap = {[key: string]: string | number};

export const normalizeDependencyMap = (deps: DependenciesMap) =>
  Object.keys(deps)
    .map((dependency) => `${dependency}@${deps[dependency]}`)
    .sort();

export const hashForDependencyMap = (deps: DependenciesMap = {}) => {
  const depsList = normalizeDependencyMap(deps);
  const depsString = depsList.join('\n');

  return createFileHash(depsString);
};

export const createPackageJsonCheckSums = ({
  dependencies,
  devDependencies,
}: PackageJSONConfig) => ({
  dependencies: hashForDependencyMap(dependencies),
  devDependencies: hashForDependencyMap(devDependencies),
});
