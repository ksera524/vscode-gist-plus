import fc from 'fast-check';

import { profiles } from '../profile-service.js';

const mockState = {
  get: jest.fn(() => ({
    'existing profile': { active: true, key: '123', url: 'abc' }
  })),
  keys: jest.fn(() => []),
  update: jest.fn()
};
const gh = { GitHub: { active: false, key: 'foo', url: 'http://foo.bar.com' } };
const ghe = {
  'GitHub Enterprise': { active: false, key: 'bar', url: 'http://baz.bat.com' }
};

profiles.configure({ state: mockState });

describe('Profile Service Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('#add', () => {
    test('should add a profile', async () => {
      expect.assertions(3);

      await profiles.add('test name', 'test key', 'test url', true);

      expect(mockState.get).toHaveBeenCalledTimes(1);
      expect(mockState.update).toHaveBeenCalledTimes(1);
      expect(mockState.update).toHaveBeenCalledWith('profiles', {
        'existing profile': { active: false, key: '123', url: 'abc' },
        'test name': { active: true, key: 'test key', url: 'test url' }
      });
    });
  });
  describe('#getAll', () => {
    test('should return array', () => {
      expect.assertions(1);

      expect(profiles.getAll()).toStrictEqual([
        { active: true, key: '123', name: 'existing profile', url: 'abc' }
      ]);
    });
    test('should return array with two profiles', () => {
      expect.assertions(2);

      mockState.get.mockReturnValue({ ...gh, ...ghe } as Services);

      expect(profiles.getAll().length).toBe(2);
      expect(profiles.getAll()[1]).toStrictEqual({
        active: ghe['GitHub Enterprise'].active,
        key: ghe['GitHub Enterprise'].key,
        name: 'GitHub Enterprise',
        url: ghe['GitHub Enterprise'].url
      });
    });
  });
  describe('#get', () => {
    test('should return "undefined" if profile none is active', () => {
      expect.assertions(2);

      expect(() => profiles.get()).not.toThrowError();
      expect(profiles.get()).toBeUndefined();
    });
    test('should return a profile when one is active', () => {
      expect.assertions(2);

      const ghe2 = {
        'GitHub Enterprise': { ...ghe['GitHub Enterprise'], active: true }
      };

      mockState.get.mockReturnValue({ ...gh, ...ghe2 } as Services);

      expect(() => profiles.get()).not.toThrowError();
      expect(profiles.get()).toStrictEqual({
        active: ghe2['GitHub Enterprise'].active,
        key: ghe2['GitHub Enterprise'].key,
        name: 'GitHub Enterprise',
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
            expect(profiles.getAll()).toHaveLength(
              Object.keys(rawProfiles).length
            );
          }
        )
      );
    });
  });
});
