import { commands, ExtensionContext, window } from 'vscode';

import {
  GistCommands,
  StatusBarCommands
} from './commands/extension-commands.js';
import { logger } from './logger/index.js';
import { profiles } from './profiles/index.js';

export async function resetState(context: ExtensionContext): Promise<void> {
  const selection = await window.showWarningMessage(
    'Reset all GistPlus state, including profiles and access tokens?',
    { modal: true },
    'Reset'
  );

  if (selection !== 'Reset') {
    logger.info('User Aborted Reset State');

    return;
  }

  await context.globalState.update('gisttoken', undefined);
  await context.globalState.update('gist_provider', undefined);
  await profiles.reset();
  await context.globalState.update('migrations', undefined);

  await commands.executeCommand(StatusBarCommands.Update);
  await commands.executeCommand(GistCommands.UpdateAccessKey);
}
