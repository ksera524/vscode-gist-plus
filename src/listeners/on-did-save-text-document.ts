import { window } from 'vscode';

import { getListener, Listeners } from './extension-listeners.js';

const onDidSaveTextDocument: ListenerInitializer = (
  _config: Configuration,
  services: Services,
  utils: Utils
): [Listener, ListenerFn] => {
  const { gists, logger } = services;
  const listener = Listeners.OnDidSaveTextDocument;
  const listenerStr = getListener(listener);
  const isGistTextDocument = (value: unknown): value is GistTextDocument =>
    typeof value === 'object' && value !== null && 'fileName' in value;

  const listenerFn = async (docValue: unknown): Promise<void> => {
    let file = '';
    try {
      if (!isGistTextDocument(docValue)) {
        throw new Error('Invalid document payload');
      }

      const doc = docValue;
      const editor = window.activeTextEditor;
      const { id, filename, content } = utils.files.extractTextDocumentDetails(
        doc,
        editor
      );
      file = `"${filename}" `;
      if (id) {
        logger.info(`Saving "${filename}"`);
        await gists.updateGist(id, filename, content);
        utils.notify.info(`Saved "${filename}"`);
      } else {
        logger.info(`"${doc.fileName}" Not a Gist`);
      }
    } catch (err) {
      const error: Error = err as Error;
      logger.error(`${listenerStr} > ${error && error.message}`);
      if (error && error.message === 'Not Found') {
        utils.notify.error(
          `Could Not Save ${file}`,
          `Reason: ${error.message}`
        );
      }
    }
  };

  return [listener, listenerFn];
};

export { onDidSaveTextDocument };
