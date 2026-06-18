import { commands, window } from 'vscode';

import { GistCommands } from '../extension-commands.js';

const deleteCommand: CommandInitializer = (
  _config: Configuration,
  services: Services,
  utils: Utils
): [Command, CommandFn] => {
  const { gists, logger } = services;

  const command = GistCommands.Delete;

  const closeGistEditors = (gistId: string): void => {
    const editors = window.visibleTextEditors;

    editors.forEach((e) => {
      const { id } = utils.files.extractTextDocumentDetails(e.document);
      if (gistId === id) {
        window.showTextDocument(e.document);
        commands.executeCommand('workbench.action.closeActiveEditor');
      }
    });
  };

  const commandFn = async (): Promise<void> => {
    try {
      const editor = window.activeTextEditor;
      const doc: undefined | GistTextDocument = editor && editor.document;
      if (!doc) {
        throw new Error('Document Missing');
      }
      const { id } = utils.files.extractTextDocumentDetails(doc);
      if (id) {
        const canDelete =
          (await utils.input.prompt('Enter "DELETE" to confirm')) === 'DELETE';
        if (!canDelete) {
          logger.info('User Aborted Deletion');

          return;
        }
        logger.info(`Deleting Gist "${id}"`);
        await gists.deleteGist(id);
        closeGistEditors(id);
        utils.notify.info('Deleted Gist');
      } else {
        logger.info(`"${doc.fileName}" Not a Gist`);
        utils.notify.info('Document Is Not a Gist');
      }
    } catch (err) {
      const error: Error = err as Error;
      logger.error(`${command} > ${error && error.message}`);
      utils.notify.error('Could Not Delete Gist', `Reason: ${error.message}`);
    }
  };

  return [command, commandFn];
};

export { deleteCommand };
