export const addContent = (content: string, newLines: string[]) =>
  newLines.reduce((acc, line) => {
    return `${acc}${line}\n`;
  }, `${content}\n`);
