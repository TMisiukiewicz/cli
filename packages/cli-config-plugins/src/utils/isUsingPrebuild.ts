import path from 'path';
import fs from 'fs-extra';

const isUsingPrebuild = (projectRoot: string): boolean => {
  return fs.existsSync(path.join(projectRoot, '.react-native'));
};

export default isUsingPrebuild;
