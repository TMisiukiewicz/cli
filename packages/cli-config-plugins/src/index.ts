import generate from './commands/generate';

export * from './tools';
export {generateNativeProjects} from './commands/generate/generate';

export const commands = [generate];
