import { Memento, workspace } from 'vscode';

const isMemento = (value: unknown): value is Memento =>
  typeof value === 'object' &&
  value !== null &&
  'get' in value &&
  'update' in value;

const getDefaultState = (): Memento => {
  const config = workspace.getConfiguration();

  if (!isMemento(config)) {
    throw new Error('Invalid configuration state');
  }

  return config;
};

const createProfileService = (initialState?: Memento): Profiles => {
  let state = initialState || getDefaultState();

  const getRawProfiles = (): { [x: string]: RawProfile } =>
    state.get<{ [x: string]: RawProfile }>('profiles', {});

  return {
    add: async (
      name: string,
      key: string,
      url: string = 'https://api.github.com',
      active: boolean = false
    ): Promise<void> => {
      const existingProfiles = getRawProfiles();
      const currentState = Object.entries(existingProfiles)
        .map(([profileName, profile]) => ({
          [profileName]: {
            active: false,
            key: profile.key,
            url: profile.url
          }
        }))
        .reduce((prev, curr) => ({ ...prev, ...curr }), {});

      await state.update('profiles', {
        ...currentState,
        [name]: { active, key, url }
      });
    },
    configure: (options: { state: Memento }): void => {
      state = options.state;
    },
    get: (): Profile | undefined => {
      const rawProfiles = getRawProfiles();

      return Object.entries(rawProfiles)
        .map(([profileName, profile]) => ({
          active: profile.active,
          key: profile.key,
          name: profileName,
          url: profile.url
        }))
        .find((profile) => profile.active);
    },
    getAll: (): Profile[] => {
      const rawProfiles = getRawProfiles();

      return Object.entries(rawProfiles).map(([profileName, profile]) => ({
        active: profile.active,
        key: profile.key,
        name: profileName,
        url: profile.url
      }));
    },
    reset: async (): Promise<void> => {
      await state.update('profiles', undefined);
    }
  };
};

export { createProfileService };
export const profiles = createProfileService();
