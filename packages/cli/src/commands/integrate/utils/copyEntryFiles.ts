import path from 'path';
import fs from 'fs-extra';
import {CLIError} from '@react-native-community/cli-tools';

export default (projectRoot: string) => {
  const templatePath = path.join(
    projectRoot,
    'node_modules',
    'react-native',
    'template',
  );
  const filesToCopy = ['index.js', 'App.tsx', 'app.json'];

  if (!fs.existsSync(templatePath)) {
    throw new CLIError(
      'Template folder not found. Do you have React Native installed in your project?',
    );
  }

  filesToCopy.forEach((file) => {
    const sourcePath = path.join(templatePath, file);
    const destinationPath = path.join(projectRoot, file);

    fs.copyFileSync(sourcePath, destinationPath);
  });
};
