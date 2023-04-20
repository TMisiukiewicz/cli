import generate from './commands/generate';

export {generateNativeProjects} from './commands/generate/generate';
export {updateGitignore, isUsingPrebuild, removeGeneratedFiles} from './utils';

export const commands = [generate];
