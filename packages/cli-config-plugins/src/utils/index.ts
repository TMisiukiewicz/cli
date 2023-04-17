import addContent from './addContent';
import applyPlugins from './applyPlugins';
import copyTemplateFiles from './copyTemplateFiles';
import createFileHash from './createFileHash';
import removeGeneratedFiles from './removeGeneratedFiles';
import updateGitignore from './updateGitignore';

export * from './defaultPlugins';
export * from './reactNative';
export * from './updatePackageJson';

export {
  addContent,
  applyPlugins,
  copyTemplateFiles,
  createFileHash,
  removeGeneratedFiles,
  updateGitignore,
};
