class Logger {
  public debug(...args: unknown[]): void;

  public error(...args: unknown[]): void;

  public info(...args: unknown[]): void;

  public setLevel(level: Levels): void;

  public warn(...args: unknown[]): void;
}
