//@ts-nocheck
import semver from 'semver';

export default function compareDeploymentTargets(
  appMajorVersion: string,
  rnMajorVersion: string,
) {
  if (
    semver.major(semver.coerce(appMajorVersion)) <
    semver.major(semver.coerce(rnMajorVersion))
  ) {
    throw new Error(
      `iOS deployment target version is ${appMajorVersion} and it should be minimum ${rnMajorVersion}. Please upgrade your iOS version before continuing.`,
    );
  }
}
