import { window } from 'vscode';
import type { Gist } from '../types/gist.js';

const prompt = async (
  message: string,
  defaultValue?: string,
  options: { password?: boolean } = {}
): Promise<string> =>
  (await window.showInputBox({
    password: options.password,
    prompt: message,
    value: defaultValue
  })) || '';

const format = (list: Gist[]): QuickPickGist[] =>
  list.map((item, i, j) => ({
    block: item,
    description: `${item.public ? 'PUBLIC' : 'PRIVATE'} - Files: ${
      item.fileCount
    } - Created: ${item.createdAt} - Updated: ${item.updatedAt}`,
    label: `${j.length - i}. ${item.name}`
  }));

const quickPick = async (gists: Gist[]): Promise<QuickPickGist | undefined> =>
  window.showQuickPick(format(gists));

export { prompt, quickPick };
