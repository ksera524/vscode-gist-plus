import fc from 'fast-check';
import type { Memento, SecretStorage } from 'vscode';

import {
  createProfileService,
  createProfileState,
  profiles,
  toSecretKey,
  toProfiles
} from '../profile-service.js';

const mockSecrets = {
  delete: jest.fn(async () => undefined),
  get: jest.fn(async (key: string) =>
    key.includes('existing%20profile') ? '123' : undefined
  ),
  keys: jest.fn(async () => []),
  onDidChange: jest.fn(),
  store: jest.fn(async () => undefined)
};

const defaultRawProfiles = {
  'existing profile': {
    active: true,
    secretKey: toSecretKey('existing profile'),
    url: 'abc'
  }
};

const mockState = {
  get: jest.fn(() => defaultRawProfiles),
  keys: jest.fn(() => []),
  update: jest.fn()
};
const gh = {
  GitHub: {
    active: false,
    secretKey: toSecretKey('GitHub'),
    url: 'http://foo.bar.com'
  }
};
const ghe = {
  'GitHub Enterprise': {
    active: false,
    secretKey: toSecretKey('GitHub Enterprise'),
    url: 'http://baz.bat.com'
  }
};

profiles.configure({ secrets: mockSecrets, state: mockState });

describe('Profile Service Tests', () => {
  beforeEach(() => {
    mockState.get.mockImplementation(() => defaultRawProfiles);
    mockSecrets.get.mockImplementation(async (key: string) =>
      key.includes('existing%20profile') ? '123' : undefined
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('#add', () => {
    test('should add a profile', async () => {
      expect.assertions(4);

      await profiles.add('test name', 'test key', 'test url', true);

      expect(mockState.get).toHaveBeenCalledTimes(1);
      expect(mockSecrets.store).toHaveBeenCalledWith(
        toSecretKey('test name'),
        'test key'
      );
      expect(mockState.update).toHaveBeenCalledTimes(1);
      expect(mockState.update).toHaveBeenCalledWith('profiles', {
        'existing profile': {
          active: false,
          secretKey: toSecretKey('existing profile'),
          url: 'abc'
        },
        'test name': {
          active: true,
          secretKey: toSecretKey('test name'),
          url: 'test url'
        }
      });
    });
  });
  describe('profile transforms', () => {
    test('createProfileState deactivates existing profiles when adding', () => {
      expect.assertions(1);

      expect(
        createProfileState(
          {
            first: {
              active: true,
              secretKey: 'first-key',
              url: 'first-url'
            },
            second: {
              active: true,
              secretKey: 'second-key',
              url: 'second-url'
            }
          },
          'third',
          'third-key',
          'third-url',
          true
        )
      ).toStrictEqual({
        first: { active: false, secretKey: 'first-key', url: 'first-url' },
        second: { active: false, secretKey: 'second-key', url: 'second-url' },
        third: { active: true, secretKey: 'third-key', url: 'third-url' }
      });
    });

    test('toProfiles maps raw profile keys to profile names', async () => {
      expect.assertions(1);

      const rawProfiles = { ...gh, ...ghe };

      expect(
        (await toProfiles(rawProfiles)).map((profile) => profile.name)
      ).toEqual(Object.keys(rawProfiles));
    });
  });
  describe('#getAll', () => {
    test('should return array', async () => {
      expect.assertions(1);

      expect(await profiles.getAll()).toStrictEqual([
        {
          active: true,
          key: '123',
          name: 'existing profile',
          secretKey: toSecretKey('existing profile'),
          url: 'abc'
        }
      ]);
    });
    test('should return array with two profiles', async () => {
      expect.assertions(2);

      mockState.get.mockReturnValue({ ...gh, ...ghe } as Services);
      mockSecrets.get.mockImplementation(async (key: string) =>
        key.includes('GitHub%20Enterprise') ? 'bar' : 'foo'
      );

      const allProfiles = await profiles.getAll();
      expect(allProfiles.length).toBe(2);
      expect(allProfiles[1]).toStrictEqual({
        active: ghe['GitHub Enterprise'].active,
        key: 'bar',
        name: 'GitHub Enterprise',
        secretKey: ghe['GitHub Enterprise'].secretKey,
        url: ghe['GitHub Enterprise'].url
      });
    });
  });
  describe('#get', () => {
    test('should return "undefined" if profile none is active', async () => {
      expect.assertions(2);

      mockState.get.mockReturnValue(gh as Services);

      expect(() => profiles.get()).not.toThrowError();
      expect(await profiles.get()).toBeUndefined();
    });
    test('should return a profile when one is active', async () => {
      expect.assertions(2);

      const ghe2 = {
        'GitHub Enterprise': { ...ghe['GitHub Enterprise'], active: true }
      };

      mockState.get.mockReturnValue({ ...gh, ...ghe2 } as Services);
      mockSecrets.get.mockImplementation(async (key: string) =>
        key.includes('GitHub%20Enterprise') ? 'bar' : 'foo'
      );

      expect(() => profiles.get()).not.toThrowError();
      expect(await profiles.get()).toStrictEqual({
        active: ghe2['GitHub Enterprise'].active,
        key: 'bar',
        name: 'GitHub Enterprise',
        secretKey: ghe2['GitHub Enterprise'].secretKey,
        url: ghe2['GitHub Enterprise'].url
      });
    });
  });
  describe('#reset', () => {
    test('should reset profiles', async () => {
      expect.assertions(1);

      await profiles.reset();

      expect(mockState.update).toHaveBeenCalledWith('profiles', undefined);
    });
  });

  describe('#migrateSecrets', () => {
    test('migrates legacy profile keys into secret storage', async () => {
      expect.assertions(3);
      const state = {
        get: jest.fn((key: string, defaultValue?: unknown) => {
          if (key === 'profiles') {
            return {
              legacy: {
                active: true,
                key: 'legacy-token',
                url: 'https://api.github.com'
              }
            };
          }

          return defaultValue;
        }),
        update: jest.fn(async () => undefined)
      };
      const secrets = {
        delete: jest.fn(async () => undefined),
        get: jest.fn(async () => undefined),
        keys: jest.fn(async () => []),
        onDidChange: jest.fn(),
        store: jest.fn(async () => undefined)
      };
      const service = createProfileService(state as Memento);
      service.configure({ secrets: secrets as SecretStorage, state });

      await service.migrateSecrets();

      expect(secrets.store).toHaveBeenCalledWith(
        toSecretKey('legacy'),
        'legacy-token'
      );
      expect(state.update).toHaveBeenCalledWith('profiles', {
        legacy: {
          active: true,
          secretKey: toSecretKey('legacy'),
          url: 'https://api.github.com'
        }
      });
      expect(state.update).toHaveBeenCalledWith('gisttoken', undefined);
    });

    test('migrates a legacy gisttoken when no profiles exist', async () => {
      expect.assertions(2);
      const state = {
        get: jest.fn((key: string, defaultValue?: unknown) => {
          if (key === 'gisttoken') {
            return 'old-token';
          }

          return defaultValue;
        }),
        update: jest.fn(async () => undefined)
      };
      const secrets = {
        delete: jest.fn(async () => undefined),
        get: jest.fn(async () => undefined),
        keys: jest.fn(async () => []),
        onDidChange: jest.fn(),
        store: jest.fn(async () => undefined)
      };
      const service = createProfileService(state as Memento);
      service.configure({ secrets: secrets as SecretStorage, state });

      await service.migrateSecrets();

      expect(secrets.store).toHaveBeenCalledWith(
        toSecretKey('github'),
        'old-token'
      );
      expect(state.update).toHaveBeenCalledWith('profiles', {
        github: {
          active: true,
          secretKey: toSecretKey('github'),
          url: 'https://api.github.com'
        }
      });
    });
  });

  describe('PBT invariants', () => {
    test('getAll size matches raw profile key count (PBT)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 12 }),
            fc.record({
              active: fc.boolean(),
              key: fc.string({ minLength: 1, maxLength: 12 }),
              url: fc.webUrl()
            })
          ),
          async (rawProfiles) => {
            mockState.get.mockReturnValue(rawProfiles);
            expect(await profiles.getAll()).toHaveLength(
              Object.keys(rawProfiles).length
            );
          }
        )
      );
    });
  });
});
