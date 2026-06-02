import { window } from 'vscode';

const _notify = (
  type: 'error' | 'info',
  ...messages: Array<string | undefined>
): void => {
  const formattedMessage = [...messages]
    .filter((m?: string) => typeof m !== 'undefined')
    .join(' > ');
  switch (type) {
    case 'error':
      window.showErrorMessage(`GIST ERROR: ${formattedMessage}`);
      break;
    case 'info':
      window.showInformationMessage(`GIST: ${formattedMessage}`);
      break;
    default:
  }
};

export const error = (...messages: Array<string | undefined>): void => {
  _notify('error', ...messages);
};

export const info = (...messages: Array<string | undefined>): void => {
  _notify('info', ...messages);
};
