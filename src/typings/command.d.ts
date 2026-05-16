type Command = string;
type CommandFn = (...args: unknown[]) => Promise<void> | void;

type CommandInitializer = (
  _config: Configuration,
  services: Services,
  utils: Utils
) => [Command, CommandFn];
