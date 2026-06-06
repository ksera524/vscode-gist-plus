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

const toProfile = ([name, profile]: [string, RawProfile]): Profile => ({
  active: profile.active,
  key: profile.key,
  name,
  url: profile.url
});

const toProfiles = (rawProfiles: { [x: string]: RawProfile }): Profile[] =>
  Object.entries(rawProfiles).map(toProfile);

const deactivateProfiles = (rawProfiles: {
  [x: string]: RawProfile;
}): { [x: string]: RawProfile } =>
  Object.fromEntries(
    Object.entries(rawProfiles).map(([profileName, profile]) => [
      profileName,
      {
        active: false,
        key: profile.key,
        url: profile.url
      }
    ])
  );

const createProfileState = (
  rawProfiles: { [x: string]: RawProfile },
  name: string,
  key: string,
  url: string,
  active: boolean
): { [x: string]: RawProfile } => ({
  ...deactivateProfiles(rawProfiles),
  [name]: { active, key, url }
});

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

      await state.update(
        'profiles',
        createProfileState(existingProfiles, name, key, url, active)
      );
    },
    configure: (options: { state: Memento }): void => {
      state = options.state;
    },
    get: (): Profile | undefined => {
      const rawProfiles = getRawProfiles();

      return toProfiles(rawProfiles).find((profile) => profile.active);
    },
    getAll: (): Profile[] => {
      const rawProfiles = getRawProfiles();

      return toProfiles(rawProfiles);
    },
    reset: async (): Promise<void> => {
      await state.update('profiles', undefined);
    }
  };
};

export { createProfileService, createProfileState, toProfiles };
export const profiles = createProfileService();
