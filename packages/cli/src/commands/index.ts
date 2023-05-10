import {Command, DetachedCommand} from '@react-native-community/cli-types';
import {commands as cleanCommands} from '@react-native-community/cli-clean';
import {commands as doctorCommands} from '@react-native-community/cli-doctor';
import {commands as configCommands} from '@react-native-community/cli-config';
import {commands as metroCommands} from '@react-native-community/cli-plugin-metro';
import {commands as configPluginsCommands} from '@react-native-community/cli-config-plugins';
import profileHermes from '@react-native-community/cli-hermes';
import upgrade from './upgrade/upgrade';
import init from './init';
import version from './version';

export const projectCommands = [
  ...metroCommands,
  ...configCommands,
  cleanCommands.clean,
  doctorCommands.info,
  upgrade,
  profileHermes,
  version,
  ...configPluginsCommands,
] as Command[];

export const detachedCommands = [
  init,
  doctorCommands.doctor,
] as DetachedCommand[];
