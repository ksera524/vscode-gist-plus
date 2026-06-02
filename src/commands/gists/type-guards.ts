import type { Gist } from '../../types/gist.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isGistFileRecord = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((file) => {
    if (!isRecord(file)) {
      return false;
    }

    return typeof file['content'] === 'string';
  });
};

const isGist = (value: unknown): value is Gist => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value['id'] === 'string' &&
    typeof value['url'] === 'string' &&
    typeof value['description'] === 'string' &&
    typeof value['name'] === 'string' &&
    typeof value['public'] === 'boolean' &&
    typeof value['fileCount'] === 'number' &&
    isGistFileRecord(value['files'])
  );
};

export { isGist };
