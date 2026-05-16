interface GistTextDocument {
  fileName: string;
  getText(range?: unknown): string;
}
interface QuickPickGist {
  block: import('../types/gist').Gist;
  /**
   * A human readable string which is rendered less prominent.
   */
  description?: string;

  /**
   * A human readable string which is rendered less prominent.
   */
  detail?: string;
  /**
   * A human readable string which is rendered prominent.
   */
  label: string;

  /**
   * Optional flag indicating if this item is picked initially.
   * (Only honored when the picker allows multiple selections.)
   *
   * @see [QuickPickOptions.canPickMany](#QuickPickOptions.canPickMany)
   */
  picked?: boolean;
}

interface Extension {
  packageJSON: { version: string };
}
