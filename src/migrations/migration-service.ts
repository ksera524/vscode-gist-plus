import { Memento, workspace } from 'vscode';

import { logger } from '../logger';

type Migration = [
  string,
  (state: Memento, callback: (error?: Error) => void) => void
];

interface MigrationUpResult {
  migrated: string[];
}

class MigrationService {
  private migrations: Migration[] = [];
  private state: Memento;

  public constructor(state?: Memento) {
    this.state = state || (workspace.getConfiguration() as unknown as Memento);
  }

  public configure(options: { migrations: Migration[]; state: Memento }): void {
    this.state = options.state;
    this.migrations = options.migrations;
  }

  public async up(): Promise<MigrationUpResult> {
    const migrated: string[] = [];

    for (const migration of this.migrations) {
      const [migrationName, migrationFn] = migration;
      if (!this.do(migrationName)) {
        continue;
      }

      logger.debug(`migrating ${migrationName}`);

      try {
        await this.runMigration(migrationFn);
      } catch (err) {
        logger.error(`could not migrate to ${migrationName}`);
        throw err instanceof Error ? err : new Error('unknown migration error');
      }

      await this.recordMigration(migrationName);
      migrated.push(migrationName);
    }

    return { migrated };
  }

  private do(migrationName: string): boolean {
    const pastMigrations = this.state.get('migrations', '').split(';');

    return pastMigrations.indexOf(migrationName) === -1;
  }

  private async recordMigration(migrationName: string): Promise<void> {
    const pastMigrations = this.state.get('migrations', '').split(';');
    pastMigrations.push(migrationName);
    await this.state.update('migrations', pastMigrations.join(';'));
    logger.debug(`Applied Migration: ${migrationName}`);
  }

  private runMigration(
    migrationFn: (state: Memento, callback: (error?: Error) => void) => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      migrationFn(this.state, (error?: Error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

export { MigrationService };
export const migrations = new MigrationService();
