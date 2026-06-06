import { Disposable, workspace } from 'vscode';

import * as utils from '../utils/index.js';

import { getListener } from './extension-listeners.js';
import { onDidSaveTextDocument } from './on-did-save-text-document.js';

const listenerInitializers: ListenerInitializer[] = [onDidSaveTextDocument];

const toListenerRegistration = (
  config: Configuration,
  services: Services,
  listenerInit: ListenerInitializer
): [Listener, ListenerFn] => listenerInit(config, services, utils);

const registerWorkspaceListener = ([listenerIndex, listenerFn]: [
  Listener,
  ListenerFn
]): Disposable => {
  const listener = getListener(listenerIndex);

  switch (listener) {
    case 'onDidChangeConfiguration':
      return workspace.onDidChangeConfiguration(listenerFn);
    case 'onDidChangeTextDocument':
      return workspace.onDidChangeTextDocument(listenerFn);
    case 'onDidChangeWorkspaceFolders':
      return workspace.onDidChangeWorkspaceFolders(listenerFn);
    case 'onDidCloseTextDocument':
      return workspace.onDidCloseTextDocument(listenerFn);
    case 'onDidOpenTextDocument':
      return workspace.onDidOpenTextDocument(listenerFn);
    case 'onDidSaveTextDocument':
      return workspace.onDidSaveTextDocument(listenerFn);
    case 'onWillSaveTextDocument':
      return workspace.onWillSaveTextDocument(listenerFn);
    default:
      throw new Error('invalid listener');
  }
};

const init = (
  config: Configuration,
  services: Services,
  initializers: ListenerInitializer[] = listenerInitializers
): { listenerCount: number; listeners: Disposable[] } => {
  const { logger } = services;
  const registered = initializers
    .map((initializer) => toListenerRegistration(config, services, initializer))
    .map(registerWorkspaceListener);

  logger.debug('initializing listeners');

  return { listenerCount: registered.length, listeners: registered };
};

export { init, toListenerRegistration };
