import { Memento, workspace } from 'vscode';

import { logger } from '../logger';

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

type Migration = [
  string,
  (state: Memento, callback: (error?: Error) => void) => void
];

interface MigrationUpResult {
  migrated: string[];
}

const createMigrationService = (initialState?: Memento): MigrationService => {
  let migrationsList: Migration[] = [];
  let state = initialState || getDefaultState();

  const runMigration = (
    migrationFn: (state: Memento, callback: (error?: Error) => void) => void
  ): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      migrationFn(state, (error?: Error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

  const doMigration = (migrationName: string): boolean => {
    const pastMigrations = state.get('migrations', '').split(';');

    return pastMigrations.indexOf(migrationName) === -1;
  };

  const recordMigration = async (migrationName: string): Promise<void> => {
    const pastMigrations = state.get('migrations', '').split(';');
    pastMigrations.push(migrationName);
    await state.update('migrations', pastMigrations.join(';'));
    logger.debug(`Applied Migration: ${migrationName}`);
  };

  return {
    configure: (options: { migrations: Migration[]; state: Memento }): void => {
      state = options.state;
      migrationsList = options.migrations;
    },
    up: async (): Promise<MigrationUpResult> => {
      const migrated: string[] = [];

      for (const migration of migrationsList) {
        const [migrationName, migrationFn] = migration;
        if (!doMigration(migrationName)) {
          continue;
        }

        logger.debug(`migrating ${migrationName}`);

        try {
          await runMigration(migrationFn);
        } catch (err) {
          logger.error(`could not migrate to ${migrationName}`);
          throw err instanceof Error
            ? err
            : new Error('unknown migration error');
        }

        await recordMigration(migrationName);
        migrated.push(migrationName);
      }

      return { migrated };
    }
  };
};

interface MigrationService {
  configure(options: { migrations: Migration[]; state: Memento }): void;
  up(): Promise<MigrationUpResult>;
}

export type { Migration, MigrationUpResult, MigrationService };
export { createMigrationService };
export const migrations = createMigrationService();
