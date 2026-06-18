import { commands, Disposable } from 'vscode';

import * as utils from '../utils/index.js';

import * as gists from './gists/index.js';
import * as profiles from './profiles/index.js';
import * as status from './status-bar/index.js';

const commandInitializers: CommandInitializer[] = [
  gists.add,
  gists.create,
  gists.createConfirmation,
  gists.deleteCommand,
  gists.deleteFile,
  gists.insert,
  gists.insertFavorite,
  gists.open,
  gists.openFavorite,
  gists.openInBrowser,
  gists.updateAccessKey,
  profiles.create,
  profiles.select,
  status.update
];

const toCommandRegistration = (
  config: Configuration,
  services: Services,
  commandInit: CommandInitializer
): CommandRegistration => commandInit(config, services, utils);

const registerCommand = ([
  command,
  commandFn,
  extraDisposables = []
]: CommandRegistration): Disposable[] => [
  commands.registerCommand(command, commandFn),
  ...extraDisposables
];

const init = (
  config: Configuration,
  services: Services,
  initializers: CommandInitializer[] = commandInitializers
): { commandCount: number; commands: Disposable[] } => {
  const { logger } = services;
  const registered = initializers
    .map((initializer) => toCommandRegistration(config, services, initializer))
    .flatMap(registerCommand);

  logger.debug('initializing commands');

  return { commandCount: initializers.length, commands: registered };
};

export { init, toCommandRegistration };
