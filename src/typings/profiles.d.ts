interface Memento {
  /**
   * Return a value.
   *
   * @param key A string.
   * @return The stored value or `undefined`.
   */
  get<T>(key: string): T | undefined;

  /**
   * Return a value.
   *
   * @param key A string.
   * @param defaultValue A value that should be returned when there is no
   * value (`undefined`) with the given key.
   * @return The stored value or the defaultValue.
   */
  get<T>(key: string, defaultValue: T): T;

  /**
   * Store a value. The value must be JSON-stringifyable.
   *
   * @param key A string.
   * @param value A value. MUST not contain cyclic references.
   */
  update(key: string, value: unknown): Thenable<void>;
}

interface RawProfile {
  active: boolean;
  key?: string;
  secretKey?: string;
  url: string;
}

interface Profile {
  active: boolean;
  key: string;
  name: string;
  secretKey: string;
  url: string;
}

interface SecretStorage {
  delete(key: string): Thenable<void>;
  get(key: string): Thenable<string | undefined>;
  store(key: string, value: string): Thenable<void>;
}

interface Profiles {
  add(name: string, key: string, url?: string, active?: boolean): Promise<void>;
  configure(options: { secrets?: SecretStorage; state: Memento }): void;
  get(): Promise<Profile | undefined>;
  getAll(): Promise<Profile[]>;
  migrateSecrets(): Promise<void>;
  reset(): Promise<void>;
}
