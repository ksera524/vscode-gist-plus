import { workspace } from 'vscode';
import type { Memento, SecretStorage } from 'vscode';

import { PROFILE_SECRET_PREFIX } from '../constants.js';

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

const createMemorySecrets = (): SecretStorage => {
  const values = new Map<string, string>();

  return {
    delete: async (key: string): Promise<void> => {
      values.delete(key);
    },
    get: async (key: string): Promise<string | undefined> => values.get(key),
    keys: async (): Promise<string[]> => Array.from(values.keys()),
    store: async (key: string, value: string): Promise<void> => {
      values.set(key, value);
    },
    onDidChange: (() => ({
      dispose: () => undefined
    })) as SecretStorage['onDidChange']
  };
};

const toSecretKey = (name: string): string =>
  `${PROFILE_SECRET_PREFIX}.${encodeURIComponent(name)}.token`;

const toProfile = async (
  secrets: SecretStorage,
  [name, profile]: [string, RawProfile]
): Promise<Profile> => {
  const secretKey = profile.secretKey || toSecretKey(name);

  return {
    active: profile.active,
    key: (await secrets.get(secretKey)) || profile.key || '',
    name,
    secretKey,
    url: profile.url
  };
};

const toProfiles = async (
  rawProfiles: { [x: string]: RawProfile },
  secrets: SecretStorage = createMemorySecrets()
): Promise<Profile[]> =>
  Promise.all(
    Object.entries(rawProfiles).map((entry) => toProfile(secrets, entry))
  );

const deactivateProfiles = (rawProfiles: {
  [x: string]: RawProfile;
}): { [x: string]: RawProfile } =>
  Object.fromEntries(
    Object.entries(rawProfiles).map(([profileName, profile]) => [
      profileName,
      {
        active: false,
        ...(profile.secretKey ? { secretKey: profile.secretKey } : {}),
        url: profile.url
      }
    ])
  );

const createProfileState = (
  rawProfiles: { [x: string]: RawProfile },
  name: string,
  secretKey: string,
  url: string,
  active: boolean
): { [x: string]: RawProfile } => ({
  ...deactivateProfiles(rawProfiles),
  [name]: { active, secretKey, url }
});

const createProfileService = (initialState?: Memento): Profiles => {
  let state = initialState || getDefaultState();
  let secrets = createMemorySecrets();

  const getRawProfiles = (): { [x: string]: RawProfile } =>
    state.get<{ [x: string]: RawProfile }>('profiles', {});

  const migrateRawProfiles = async (): Promise<void> => {
    const legacyKey = state.get<string>('gisttoken');
    const rawProfiles = getRawProfiles();
    const profilesToMigrate =
      Object.keys(rawProfiles).length > 0
        ? rawProfiles
        : legacyKey
          ? {
              github: {
                active: true,
                key: legacyKey,
                url: 'https://api.github.com'
              }
            }
          : {};

    const migrated = await Promise.all(
      Object.entries(profilesToMigrate).map(async ([name, profile]) => {
        const secretKey = profile.secretKey || toSecretKey(name);

        if (profile.key && !(await secrets.get(secretKey))) {
          await secrets.store(secretKey, profile.key);
        }

        return [
          name,
          {
            active: profile.active,
            secretKey,
            url: profile.url
          }
        ] as [string, RawProfile];
      })
    );

    if (migrated.length > 0) {
      await state.update('profiles', Object.fromEntries(migrated));
    }

    await state.update('gisttoken', undefined);
    await state.update('gist_provider', undefined);
  };

  return {
    add: async (
      name: string,
      key: string,
      url: string = 'https://api.github.com',
      active: boolean = false
    ): Promise<void> => {
      const existingProfiles = getRawProfiles();
      const secretKey = toSecretKey(name);

      await secrets.store(secretKey, key);

      await state.update(
        'profiles',
        createProfileState(existingProfiles, name, secretKey, url, active)
      );
    },
    configure: (options: { secrets?: SecretStorage; state: Memento }): void => {
      state = options.state;
      secrets = options.secrets || createMemorySecrets();
    },
    get: async (): Promise<Profile | undefined> => {
      const rawProfiles = getRawProfiles();

      return (await toProfiles(rawProfiles, secrets)).find(
        (profile) => profile.active
      );
    },
    getAll: (): Promise<Profile[]> => {
      const rawProfiles = getRawProfiles();

      return toProfiles(rawProfiles, secrets);
    },
    migrateSecrets: migrateRawProfiles,
    reset: async (): Promise<void> => {
      const rawProfiles = getRawProfiles();
      const secretKeys = Object.entries(rawProfiles).map(
        ([name, profile]) => profile.secretKey || toSecretKey(name)
      );

      await Promise.all(
        secretKeys.map((secretKey) => secrets.delete(secretKey))
      );
      await state.update('profiles', undefined);
    }
  };
};

export { createProfileService, createProfileState, toProfiles, toSecretKey };
export const profiles = createProfileService();
