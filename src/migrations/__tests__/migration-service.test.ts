import fc from 'fast-check';

import { migrations } from '../migration-service.js';
import type { Migration } from '../migration-service.js';

const state = {
  get: jest.fn(() => ''),
  keys: jest.fn(() => []),
  update: jest.fn()
};

describe('Migrations Tests', () => {
  test('should process migrations', async () => {
    expect.assertions(3);

    const migrationCallback = jest.fn(
      (_s: unknown, c: (error?: Error) => void) => {
        c();
      }
    );

    const migrationOne: [
      string,
      (state: unknown, callback: (error?: Error) => void) => void
    ] = ['mymigrationone', migrationCallback];
    const migrationTwo: [
      string,
      (state: unknown, callback: (error?: Error) => void) => void
    ] = ['mygrationtwo', migrationCallback];

    migrations.configure({ migrations: [migrationOne, migrationTwo], state });
    const results = await migrations.up();

    expect(results).toStrictEqual({
      migrated: ['mymigrationone', 'mygrationtwo']
    });
    expect(migrationCallback).toHaveBeenCalledTimes(2);
    expect(state.update.mock.calls).toHaveLength(2);
  });

  test('applies only non-recorded migrations (PBT)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(fc.stringMatching(/^[a-z0-9_-]{1,8}$/), {
          minLength: 1,
          maxLength: 8
        }),
        fc.array(fc.nat(7), { maxLength: 8 }),
        async (names, indexCandidates) => {
          const recordedNames = indexCandidates
            .map((n) => names[n % names.length])
            .filter((value, index, arr) => arr.indexOf(value) === index);
          const stateForCase = {
            get: jest.fn(() => recordedNames.join(';')),
            keys: jest.fn(() => []),
            update: jest.fn(async () => undefined)
          };

          const callback = jest.fn((_s: unknown, c: (error?: Error) => void) =>
            c()
          );
          const list = names.map((name) => [name, callback] as Migration);

          migrations.configure({ migrations: list, state: stateForCase });
          const result = await migrations.up();
          const expected = names.filter(
            (name) => !recordedNames.includes(name)
          );

          expect(result.migrated).toStrictEqual(expected);
          expect(callback).toHaveBeenCalledTimes(expected.length);
        }
      )
    );
  });
});
