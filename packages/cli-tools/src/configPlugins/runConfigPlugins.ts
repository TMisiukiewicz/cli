import loadConfig from '@react-native-community/cli-config';
import {Resources, Strings} from '@expo/config-plugins/build/android';
import {writeXMLAsync} from '@expo/config-plugins/build/utils/XML';

const providers = (projectRoot: string) => ({
  strings: {
    getFilePath: () => Strings.getProjectStringsXMLPathAsync(projectRoot),
    read: (filePath: string) =>
      Resources.readResourcesXMLAsync({path: filePath}),
    write: (filePath: string, result: Resources.ResourceXML) =>
      writeXMLAsync({path: filePath, xml: result}),
  },
});

export default async function runConfigPlugins() {
  const config = loadConfig();
  const providerList = providers(config.root);
  const filePath = await providerList.strings.getFilePath();
  const file = await providerList.strings.read(filePath);
  const updatedFile = Strings.setStringItem(config.mods.android.strings, file);
  await providerList.strings.write(filePath, updatedFile);
}
