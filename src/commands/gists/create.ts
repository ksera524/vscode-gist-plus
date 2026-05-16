import { commands, window } from 'vscode';

import { GistCommands } from '../extension-commands';

import { openGist } from './utils';

const create: CommandInitializer = (
  config: Configuration,
  services: Services,
  utils: Utils
): [Command, CommandFn] => {
  const { gists, logger } = services;

  const command = GistCommands.Create;

  const commandFn = async (): Promise<void> => {
    let gistName = '';
    try {
      const editor = window.activeTextEditor || window.visibleTextEditors[0];
      const isUntitled = editor?.document?.uri?.scheme === 'untitled';
      const tmpFilename = editor
        ? isUntitled
          ? 'untitled.txt'
          : utils.files.getFileName(editor.document)
        : 'untitled.txt';
      const selection = editor?.selection;
      const content = !editor
        ? ''
        : isUntitled
          ? ' '
          : editor.document.getText(selection?.isEmpty ? undefined : selection);
      const normalizedContent = content || ' ';
      const filenameInput =
        (await utils.input.prompt('Enter filename', tmpFilename)) || '';
      const filename = filenameInput.trim() || tmpFilename;
      const descriptionInput =
        (await utils.input.prompt('Enter description')) || '';
      const description = descriptionInput.trim();
      const defaultValue = config.get<boolean>('defaultPrivate') ? 'N' : 'Y';
      const isPublic =
        (
          (await utils.input.prompt('Public? Y = Yes, N = No', defaultValue)) ||
          defaultValue
        )
          .slice(0, 1)
          .toLowerCase() === 'y';

      gistName = description || filename;
      logger.error(
        `${command} > create payload preview > filename=${filename} contentLength=${normalizedContent.length}`
      );

      const gist = await gists.createGist(
        { [filename]: { content: normalizedContent } },
        description,
        isPublic
      );

      await openGist(gist, config.get<number>('maxFiles'));
      await commands.executeCommand(GistCommands.CreateConfirmation, gist);
    } catch (err) {
      const context = gistName ? ` ${gistName}` : '';
      const error: Error = err as Error;
      logger.error(`${command} > ${error && error.message}`);
      utils.notify.error(
        `Could Not Create${context}`,
        `Reason: ${error.message}`
      );
    }
  };

  return [command, commandFn];
};

export { create };
