import { StatusBarAlignment, window } from 'vscode';

import { ProfileCommands, StatusBarCommands } from '../extension-commands.js';

const update: CommandInitializer = (
  _config: Configuration,
  services: Services,
  _utils: Utils
): CommandRegistration => {
  const { logger, profiles } = services;

  const statusBar = window.createStatusBarItem(StatusBarAlignment.Left);
  statusBar.show();

  const command = StatusBarCommands.Update;

  const commandFn = async (): Promise<void> => {
    try {
      const activeProfile = await profiles.get();
      statusBar.text = `GIST ${
        activeProfile ? `[${activeProfile.name}]` : '[Create Profile]'
      }`;
      statusBar.command = activeProfile
        ? ProfileCommands.Select
        : ProfileCommands.Create;

      logger.debug('Status Bar Updated');
    } catch (err) {
      const error: Error = err as Error;
      logger.error(`${command} > ${error && error.message}`);
    }
  };

  return [command, commandFn, [statusBar]];
};

export { update };
