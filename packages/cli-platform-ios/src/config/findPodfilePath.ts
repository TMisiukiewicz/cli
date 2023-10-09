/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import path from 'path';
import findAllPodfilePaths from './findAllPodfilePaths';
import {promptForPodfileSelection} from '../tools/prompts';

// Regexp matching all test projects
const TEST_PROJECTS = /test|example|sample/i;

// Base iOS folder
const IOS_BASE = 'ios';

// Podfile in the bundle package
const BUNDLE_VENDORED_PODFILE = 'vendor/bundle/ruby';

export default async function findPodfilePath(cwd: string) {
  const podfiles = findAllPodfilePaths(cwd)
    /**
     * Then, we will run a simple test to rule out most example projects,
     * unless they are located in a `ios` folder
     */
    .filter((project) => {
      if (path.dirname(project) === IOS_BASE) {
        // Pick the Podfile in the default project (in the iOS folder)
        return true;
      }

      if (TEST_PROJECTS.test(project)) {
        // Ignore the Podfile in test and example projects
        return false;
      }

      if (project.indexOf(BUNDLE_VENDORED_PODFILE) > -1) {
        // Ignore the podfile shipped with Cocoapods in bundle
        return false;
      }

      // Accept all the others
      return true;
    })
    /**
     * Podfile from `ios` folder will be picked up as a first one.
     */
    .sort((project) => (path.dirname(project) === IOS_BASE ? -1 : 1));

  if (podfiles.length > 0) {
    if (podfiles.length > 1) {
      const podfile = await promptForPodfileSelection(podfiles);

      return path.join(cwd, podfile);
    }
    return path.join(cwd, podfiles[0]);
  }

  return null;
}
