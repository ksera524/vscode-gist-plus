import { Memento, workspace } from 'vscode';

const createProfileService = (initialState?: Memento): Profiles => {
  let state =
    initialState || (workspace.getConfiguration() as unknown as Memento);

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
      const currentState = Object.keys(existingProfiles)
        .map((profile) => ({
          [profile]: {
            active: false,
            key: existingProfiles[profile].key,
            url: existingProfiles[profile].url
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

      return Object.keys(rawProfiles)
        .map((profileName) => ({
          active: rawProfiles[profileName].active,
          key: rawProfiles[profileName].key,
          name: profileName,
          url: rawProfiles[profileName].url
        }))
        .find((profile) => profile.active);
    },
    getAll: (): Profile[] => {
      const rawProfiles = getRawProfiles();

      return Object.keys(rawProfiles).map((profileName) => ({
        active: rawProfiles[profileName].active,
        key: rawProfiles[profileName].key,
        name: profileName,
        url: rawProfiles[profileName].url
      }));
    },
    reset: async (): Promise<void> => {
      await state.update('profiles', undefined);
    }
  };
};

export { createProfileService };
export const profiles = createProfileService();
