import {ConfigPlugins} from '@react-native-community/cli-config-plugins';

export const reverseSortString = (a: string, b: string) => {
  if (a < b) {
    return 1;
  }
  if (a > b) {
    return -1;
  }
  return 0;
};

export function sortWithOrder(obj: string[], order: string[]): string[] {
  const groupOrder = [...new Set(order.concat(obj))];
  const sorted: string[] = [];

  while (groupOrder.length) {
    const key = groupOrder.shift()!;
    const index = obj.indexOf(key);
    if (index > -1) {
      const [item] = obj.splice(index, 1);
      sorted.push(item);
    }
  }

  return sorted;
}

export function sortObject<T extends Record<string, any> = Record<string, any>>(
  obj: T,
  compareFn?: (a: string, b: string) => number,
): T {
  return Object.keys(obj)
    .sort(compareFn)
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: obj[key],
      }),
      {},
    ) as T;
}

export function sortObjWithOrder<
  T extends Record<string, any> = Record<string, any>
>(obj: T, order: string[]): T {
  const sorted = sortWithOrder(Object.keys(obj), order);

  return sorted.reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key],
    }),
    {},
  ) as T;
}

export function sortAndroidManifest(obj: ConfigPlugins.AndroidManifest) {
  if (obj.manifest) {
    // Reverse sort so application is last and permissions are first
    obj.manifest = sortObject(obj.manifest, reverseSortString);

    if (Array.isArray(obj.manifest['uses-permission'])) {
      // Sort permissions alphabetically
      obj.manifest['uses-permission'].sort((a, b) => {
        if (a.$['android:name'] < b.$['android:name']) {
          return -1;
        }
        if (a.$['android:name'] > b.$['android:name']) {
          return 1;
        }
        return 0;
      });
    }

    if (Array.isArray(obj.manifest.application)) {
      // reverse sort applications so activity is towards the end and meta-data is towards the front.
      obj.manifest.application = obj.manifest.application.map((application) => {
        application = sortObjWithOrder(application, [
          'meta-data',
          'service',
          'activity',
        ]);

        if (Array.isArray(application['meta-data'])) {
          // Sort metadata alphabetically
          application['meta-data'].sort((a, b) => {
            if (a.$['android:name'] < b.$['android:name']) {
              return -1;
            }
            if (a.$['android:name'] > b.$['android:name']) {
              return 1;
            }
            return 0;
          });
        }
        return application;
      });
    }
  }
  return obj;
}

const withCustomAndroidManifest: ConfigPlugins.ConfigPlugin = (
  config,
  //@ts-ignore
  {manifestPath},
) => {
  return ConfigPlugins.withDangerousMod(config, [
    'android',
    async (conf) => {
      const filePath =
        manifestPath ||
        (await ConfigPlugins.AndroidConfig.Paths.getAndroidManifestAsync(
          conf.modRequest.projectRoot,
        ));
      const androidManifest = await ConfigPlugins.AndroidConfig.Manifest.readAndroidManifestAsync(
        filePath,
      );

      if (!config.android) {
        config.android = {};
      }
      if (!config.android.permissions) {
        config.android.permissions = [];
      }

      config.android.permissions = [
        ...new Set(
          config.android.permissions.concat(['android.permission.INTERNET']),
        ),
      ];
      conf.modResults = ConfigPlugins.AndroidConfig.Permissions.setAndroidPermissions(
        config,
        androidManifest,
      );

      await ConfigPlugins.AndroidConfig.Manifest.writeAndroidManifestAsync(
        filePath,
        //@ts-ignore
        sortAndroidManifest(conf.modResults),
      );

      return conf;
    },
  ]);
};

export default withCustomAndroidManifest;
