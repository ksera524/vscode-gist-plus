import { commands, MessageItem, window } from 'vscode';

import {
  GistCommands,
  ProfileCommands,
  StatusBarCommands
} from '../extension-commands.js';

const create: CommandInitializer = (
  _config: Configuration,
  services: Services,
  utils: Utils
): [Command, CommandFn] => {
  const { logger, profiles } = services;

  const command = ProfileCommands.Create;

  const commandFn = async (): Promise<void> => {
    try {
      const platform = await window.showInformationMessage(
        'Which GitHub Platform?',
        { modal: true },
        { title: 'GitHub.com (common)', isCloseAffordance: true },
        { title: 'GitHub Enterprise' }
      );

      if (!platform) {
        logger.debug('User Aborted Create Profile at "platform"');

        return;
      }

      const { title } = platform as MessageItem;

      const urlInput =
        title === 'GitHub Enterprise'
          ? await utils.input.prompt('Enter your enterprise API url')
          : 'https://api.github.com';
      const url = urlInput && urlInput.trim();

      if (!url) {
        logger.debug('User Aborted Create Profile at "url"');

        return;
      }

      const keyInput = await utils.input.prompt('Enter your access token', '', {
        password: true
      });
      const key = keyInput && keyInput.trim();

      if (!key) {
        logger.debug('User Aborted Create Profile at "key"');

        return;
      }

      const nameInput = await utils.input.prompt('Give this profile a name');
      const name = nameInput && nameInput.trim();

      if (!name) {
        logger.debug('User Aborted Create Profile at "name"');

        return;
      }

      await profiles.add(name, key, url, true);
      await commands.executeCommand(StatusBarCommands.Update);
      await commands.executeCommand(GistCommands.UpdateAccessKey);

      logger.debug('Profile Created');
    } catch (err) {
      const error: Error = err as Error;
      logger.error(`${command} > ${error && error.message}`);
      utils.notify.error(
        'Could Not Create Profile',
        `Reason: ${error.message}`
      );
    }
  };

  return [command, commandFn];
};

export { create };
