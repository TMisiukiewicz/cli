import semver, {SemVer} from 'semver';
import {IOS_DEPLOYMENT_TARGETS_RN_VERSIONS} from '../consts';

export default function getMinIosSupportedVersion(minDeploymentTarget: string) {
  for (const version of Object.keys(IOS_DEPLOYMENT_TARGETS_RN_VERSIONS)) {
    const v1 = semver.coerce(minDeploymentTarget) as SemVer;
    const v2 = semver.coerce(version) as SemVer;

    if (semver.compare(v1, v2) === 1) {
      return {...v2, original: version};
    }
  }

  return minDeploymentTarget;
}
