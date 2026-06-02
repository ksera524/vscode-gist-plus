import { Memento } from 'vscode';

import { up as up200 } from './migrate-2.0.0.js';

export const extensionMigrations: Array<
  [string, (state: Memento, cb: (err: Error | undefined) => void) => void]
> = [['2.0.0', up200]];
