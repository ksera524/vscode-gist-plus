import type { Gist } from '../../types/gist';

const isGist = (value: unknown): value is Gist =>
  typeof value === 'object' && value !== null && 'url' in value;

export { isGist };
