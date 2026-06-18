import {
  commands,
  Disposable,
  ExtensionContext,
  window,
  workspace
} from 'vscode';

import { init as initCommands } from './commands/index.js';
import {
  GistCommands,
  StatusBarCommands
} from './commands/extension-commands.js';
import { DEBUG } from './constants.js';
import * as gists from './gists/index.js';
import { init as initListeners } from './listeners/index.js';
import { Levels, logger } from './logger/index.js';
import { extensionMigrations, migrations } from './migrations/index.js';
import { profiles } from './profiles/index.js';
import { resetState } from './reset-state.js';

const disposables: { commands: Disposable[]; listeners: Disposable[] } = {
  commands: [],
  listeners: []
};

export function activate(context: ExtensionContext): void {
  logger.setLevel(DEBUG ? Levels.DEBUG : Levels.ERROR);
  logger.setOutput(window.createOutputChannel('Gist'));

  logger.debug('extension activated');

  migrations.configure({
    migrations: extensionMigrations,
    state: context.globalState
  });
  profiles.configure({ secrets: context.secrets, state: context.globalState });

  const config = workspace.getConfiguration('gist');
  const previousVersion = context.globalState.get('version');
  const currentVersion =
    (context.extension && context.extension.packageJSON
      ? context.extension.packageJSON.version
      : undefined) || previousVersion;

  const extCommands = initCommands(config, {
    gists,
    logger,
    profiles
  });
  const extListeners = initListeners(config, {
    gists,
    logger,
    profiles
  });

  disposables.commands = extCommands.commands;
  disposables.listeners = extListeners.listeners;

  /**
   * General Commands
   */
  const resetStateCommand = commands.registerCommand(
    'extension.resetState',
    () => resetState(context)
  );
  disposables.commands.push(resetStateCommand);

  /**
   * Execute Startup Commands
   */
  void migrations
    .up()
    .catch((err: Error) => {
      logger.error(err.message);
    })
    .then(() => profiles.migrateSecrets())
    .catch((err: Error) => {
      logger.error(err.message);
    })
    .finally(async () => {
      await commands.executeCommand(StatusBarCommands.Update);
      await commands.executeCommand(GistCommands.UpdateAccessKey);

      if (previousVersion !== currentVersion) {
        // TODO: show what's new
        await context.globalState.update('version', currentVersion);
      }
    });
}

export function deactivate(): void {
  // TODO: close open gist editors
  disposables.commands.forEach((d) => d.dispose());
  disposables.listeners.forEach((d) => d.dispose());
}
