import { OutputChannel } from 'vscode';

import { LOGGER_LEVEL } from '../constants.js';

export enum Levels {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

const createLogger = (initialLevel: Levels = LOGGER_LEVEL): Logger => {
  let level = initialLevel;
  let output: OutputChannel | undefined;

  const log = (
    method: 'debug' | 'log' | 'info' | 'warn' | 'error',
    ...args: string[]
  ): void => {
    const prefix = `vscode-gist>${method}:`;
    const message = [...args].join(' > ');

    if (output) {
      output.appendLine(`${prefix} ${message}`);
    }
  };

  return {
    debug: (...args: string[]): void => {
      if (level === Levels.DEBUG) {
        log('debug', ...args);
      }
    },
    error: (...args: string[]): void => {
      if (level <= Levels.ERROR) {
        log('error', ...args);
      }
    },
    info: (...args: string[]): void => {
      if (level <= Levels.INFO) {
        log('info', ...args);
      }
    },
    setLevel: (newLevel: Levels): void => {
      level = newLevel;
    },
    setOutput: (newOutput: OutputChannel): void => {
      output = newOutput;
    },
    warn: (...args: string[]): void => {
      if (level <= Levels.WARN) {
        log('warn', ...args);
      }
    }
  };
};

export { createLogger };
export const logger = createLogger(LOGGER_LEVEL);
