interface Logger {
  debug(...args: unknown[]): void;

  error(...args: unknown[]): void;

  info(...args: unknown[]): void;

  setLevel(level: Levels): void;

  setOutput(output: import('vscode').OutputChannel): void;

  warn(...args: unknown[]): void;
}
