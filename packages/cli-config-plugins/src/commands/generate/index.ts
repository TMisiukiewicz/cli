import generate from './generate';

export default {
  func: generate,
  name: 'generate',
  description: 'generates native projects for your app',
  options: [
    {
      name: '--clean',
      description: 'Clean the native projects before generating',
    },
    {
      name: '--ios',
      description: 'Generate iOS native project',
    },
    {
      name: '--android',
      description: 'Generate Android native project',
    },
  ],
};
