import { migrations } from '../migration-service';

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
});
