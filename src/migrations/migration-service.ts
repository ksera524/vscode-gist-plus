import { Memento, workspace } from 'vscode';

import { logger } from '../logger';

type Migration = [
  string,
  (state: Memento, callback: (error?: Error) => void) => void
];

class MigrationService {
  public static getInstance = (): MigrationService => {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }

    return MigrationService.instance;
  };

  private static instance?: MigrationService;

  private migrations: Migration[] = [];
  private state: Memento = workspace.getConfiguration() as unknown as Memento;

  private constructor() {}

  public configure(options: { migrations: Migration[]; state: Memento }): void {
    this.state = options.state;
    this.migrations = options.migrations;
  }

  public up(
    cb: (err: Error | undefined, results: { migrated: string[] }) => void
  ): void {
    const migrated: string[] = [];
    let error: Error | undefined;

    try {
      this.migrations.forEach((m) => {
        const [migrationName, migrationFn] = m;
        if (this.do(migrationName)) {
          logger.debug(`migrating ${migrationName}`);
          migrationFn(this.state, (err) => {
            if (err) {
              logger.error(`could not migrate to ${migrationName}`);
              throw err;
            }
            this.recordMigration(migrationName);
            migrated.push(migrationName);
          });
        }
      });
    } catch (err) {
      error = err instanceof Error ? err : new Error('unknown migration error');
    }

    cb(error, { migrated });
  }

  private do(migrationName: string): boolean {
    const pastMigrations = this.state.get('migrations', '').split(';');

    return pastMigrations.indexOf(migrationName) === -1;
  }

  private recordMigration(migrationName: string): void {
    const pastMigrations = this.state.get('migrations', '').split(';');
    pastMigrations.push(migrationName);
    this.state.update('migrations', pastMigrations.join(';'));
    logger.debug(`Applied Migration: ${migrationName}`);
  }
}

export const migrations = MigrationService.getInstance();
