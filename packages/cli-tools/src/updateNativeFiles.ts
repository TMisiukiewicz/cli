//@ts-nocheck
import fs from 'fs';
import loadConfig from '@react-native-community/cli-config';
import {XMLParser, XMLBuilder} from 'fast-xml-parser';
import path from 'path';

const xmlParser = new XMLParser({ignoreAttributes: false});
const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
  suppressBooleanAttributes: false,
});

export type PropertiesItem =
  | {
      type: 'comment';
      value: string;
    }
  | {
      type: 'empty';
    }
  | {
      type: 'property';
      key: string;
      value: string;
    };

export function parsePropertiesFile(contents: string): PropertiesItem[] {
  const propertiesList: PropertiesItem[] = [];
  const lines = contents.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      propertiesList.push({type: 'empty'});
    } else if (line.startsWith('#')) {
      propertiesList.push({
        type: 'comment',
        value: line.substring(1).trimStart(),
      });
    } else {
      const eok = line.indexOf('=');
      const key = line.slice(0, eok);
      const value = line.slice(eok + 1, line.length);
      propertiesList.push({type: 'property', key, value});
    }
  }

  return propertiesList;
}

function propertiesListToString(props: PropertiesItem[]): string {
  let output = '';
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    if (prop.type === 'empty') {
      output += '';
    } else if (prop.type === 'comment') {
      output += '# ' + prop.value;
    } else if (prop.type === 'property') {
      output += `${prop.key}=${prop.value}`;
    } else {
      // @ts-ignore: assertion
      throw new Error(`Invalid properties type "${prop.type}"`);
    }
    if (i < props.length - 1) {
      output += '\n';
    }
  }
  return output;
}

function withAndroidManifest({root}, value) {
  const readManifest = fs.readFileSync(
    path.join(root, 'android/app/src/main/AndroidManifest.xml'),
  );
  const {manifest} = xmlParser.parse(readManifest);

  if (value.permissions) {
    if (!Array.isArray(manifest['uses-permission'])) {
      manifest['uses-permission'] = [manifest['uses-permission']];
    }

    manifest['uses-permission'] = value.permissions.reduce((acc, curr) => {
      acc.push({'@_android:name': `android.permission.${curr}`});

      return acc;
    }, []);
  }

  const parseToXml = xmlBuilder.build({manifest});

  fs.writeFileSync(
    path.join(root, 'android/app/src/main/AndroidManifest.xml'),
    parseToXml,
    {encoding: 'utf-8'},
  );
}

async function withGradleProperties({root}, value) {
  const gradleProperties = await fs.promises.readFile(
    path.join(root, 'android/gradle.properties'),
    {encoding: 'utf-8'},
  );

  const parsedGradleProperties = parsePropertiesFile(gradleProperties);
  fs.writeFileSync(
    path.join(root, 'android/gradle.properties'),
    propertiesListToString([...parsedGradleProperties, ...value]),
    {encoding: 'utf-8'},
  );
}

function getMods() {
  return {
    android: {
      manifest: withAndroidManifest,
      gradleProperties: withGradleProperties,
    },
  };
}

export default function updateNativeFiles() {
  const config = loadConfig();

  if (config.mods) {
    const existingMods = getMods();
    const {mods} = config;

    if (mods.android) {
      for (const [key, value] of Object.entries(mods.android)) {
        const mod = existingMods.android[key];
        mod(config, value);
      }
    }
  }
}
