type Listener = number;
type ListenerFn = (...args: unknown[]) => unknown;

type ListenerInitializer = (
  config: Configuration,
  services: Services,
  utils: Utils
) => [Listener, ListenerFn];
