import { GistCommands } from '../extension-commands.js';

const getProfileOptionOverride = (
  config: Configuration,
  profileName: string
): GistServiceOptions => {
  const profileOptionOverride = config.get<{
    [profile: string]: GistServiceOptions;
  }>('profileOptions');

  return profileOptionOverride?.[profileName] || {};
};

const toGistServiceOptions = (
  profile: Profile | undefined,
  optionOverride: GistServiceOptions = {}
): GistServiceOptions =>
  profile
    ? {
        key: optionOverride.key || profile.key,
        rejectUnauthorized: optionOverride.rejectUnauthorized ?? true,
        url: optionOverride.url || profile.url
      }
    : {
        key: undefined,
        rejectUnauthorized: undefined,
        url: undefined
      };

const updateAccessKey: CommandInitializer = (
  config: Configuration,
  services: Services,
  utils: Utils
): [Command, CommandFn] => {
  const { gists, logger, profiles } = services;

  const command = GistCommands.UpdateAccessKey;

  const commandFn = async (): Promise<void> => {
    try {
      const profile = await profiles.get();
      const optionOverride = profile
        ? getProfileOptionOverride(config, profile.name)
        : {};

      gists.configure(toGistServiceOptions(profile, optionOverride));
      logger.debug('updated access key');
    } catch (err) {
      const error: Error = err as Error;
      logger.error(`${command} > ${error && error.message}`);
      utils.notify.error('Could Not Update Access Key', error.message);
    }
  };

  return [command, commandFn];
};

export { toGistServiceOptions, updateAccessKey };
