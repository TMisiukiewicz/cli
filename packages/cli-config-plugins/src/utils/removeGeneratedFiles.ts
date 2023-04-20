import fs from 'fs-extra';
import path from 'path';

const removeGeneratedFiles = (projectRoot: string) => {
  fs.removeSync(path.join(projectRoot, 'android'));
  fs.removeSync(path.join(projectRoot, 'ios'));
  fs.removeSync(path.join(projectRoot, '.react-native'));
};

export default removeGeneratedFiles;
