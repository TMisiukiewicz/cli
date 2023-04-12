import path from 'path';
import {Config} from '@react-native-community/cli-types';

const generateNativeProjectsAsync = async (_: Array<string>, ctx: Config) => {
  const {root} = ctx;

  const templatePath = path.join(
    root,
    'node_modules',
    'react-native',
    'template',
  );
  console.log(templatePath);
};

export default generateNativeProjectsAsync;
