import generate from './commands/generate';

export {generateNativeProjects} from './commands/generate/generate';
export {updateGitignore, isUsingPrebuild, removeGeneratedFiles} from './utils';

export * from '@expo/config';

export const commands = [generate];
