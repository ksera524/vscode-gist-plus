type Command = string;
type CommandFn = (...args: unknown[]) => Promise<void> | void;
type CommandRegistration = [
  command: Command,
  commandFn: CommandFn,
  disposables?: import('vscode').Disposable[]
];

type CommandInitializer = (
  _config: Configuration,
  services: Services,
  utils: Utils
) => CommandRegistration;
