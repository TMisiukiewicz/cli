import {logger} from '@react-native-community/cli-tools';
import {readFileSync, writeFileSync} from 'fs';
import {addContent} from '../utils/fileContent';

export const updateGitignore = async (projectDirectory: string) => {
  try {
    const content = readFileSync(`${projectDirectory}/.gitignore`, {
      encoding: 'utf8',
    });

    const updatedContent = addContent(content, [
      '# Native projects',
      '/ios',
      '/android',
      '.react-native',
    ]);

    writeFileSync(`${projectDirectory}/.gitignore`, updatedContent);
  } catch {
    logger.warn(
      'Failed to modify .gitignore file. Please add /ios and /android to .gitignore manually.',
    );
  }
};
