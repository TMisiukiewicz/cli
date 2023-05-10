import generate from './commands/generate';

export {
  generateNativeProjects,
  overwritePlaceholders,
} from './commands/generate/generate';
export {
  updateGitignore,
  isUsingPrebuild,
  removeGeneratedFiles,
  applyPlugins,
  copyTemplateFiles,
  getCacheFile,
} from './utils';

export * from '@expo/config';

export const commands = [generate];
