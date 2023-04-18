import generate from './commands/generate';

export {generateNativeProjects} from './commands/generate/generate';
export {updateGitignore} from './utils';

export const commands = [generate];
