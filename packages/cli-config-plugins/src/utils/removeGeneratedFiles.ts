import fs from 'fs-extra';
import path from 'path';

const removeGeneratedFiles = (
  projectRoot: string,
  options: {keepCache?: boolean} = {keepCache: false},
) => {
  fs.removeSync(path.join(projectRoot, 'android'));
  fs.removeSync(path.join(projectRoot, 'ios'));

  if (!options.keepCache) {
    fs.removeSync(path.join(projectRoot, '.react-native'));
  }
};

export default removeGeneratedFiles;
