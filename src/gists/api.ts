import { env } from 'vscode';

import { GISTS_BASE_URL, GISTS_PER_PAGE } from '../constants';
import type { Gist, GistFile } from '../types/gist';

import { gists } from './gists-service';

interface ApiGistFile {
  content?: string;
  filename?: string;
  language?: string;
  raw_url?: string;
  size?: number;
  truncated?: boolean;
  type?: string;
}

interface GistResponse {
  created_at: string;
  description: string;
  files: { [x: string]: ApiGistFile };
  html_url: string;
  id: string;
  public: boolean;
  updated_at: string;
  url: string;
}

type GistsResponse = GistResponse[];

const prepareError = (err: Error): Error => {
  try {
    return new Error(
      (JSON.parse(err && err.message) || { message: 'unknown' }).message
    );
  } catch {
    return err;
  }
};

const formatGist = (gist: unknown): Gist => {
  if (typeof gist !== 'object') {
    // TODO: consider throwing an error
    return <Gist>{};
  }
  const g = <GistResponse>gist;
  const files: { [x: string]: GistFile } = Object.keys(g.files).reduce<{
    [x: string]: GistFile;
  }>((acc, key) => {
    const file = g.files[key];
    if (!file) {
      return acc;
    }
    if (typeof file.content !== 'string') {
      throw new Error('Invalid gist file content');
    }

    const normalized: GistFile = { content: file.content };

    if (file.filename !== undefined) {
      normalized.filename = file.filename;
    }
    if (file.language !== undefined) {
      normalized.language = file.language;
    }
    if (file.raw_url !== undefined) {
      normalized.raw_url = file.raw_url;
    }
    if (file.size !== undefined) {
      normalized.size = file.size;
    }
    if (file.type !== undefined) {
      normalized.type = file.type;
    }

    acc[key] = normalized;

    return acc;
  }, {});

  return {
    createdAt: new Intl.DateTimeFormat(env.language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(g.created_at)),
    description: g.description,
    fileCount: Object.keys(g.files).length,
    files,
    id: g.id,
    name: g.description || Object.keys(g.files)[0] || '',
    public: g.public,
    updatedAt: new Intl.DateTimeFormat(env.language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(g.updated_at)),
    url: g.html_url
  };
};

const formatGists = (gistList: GistsResponse): Gist[] =>
  gistList.map(formatGist);

const toGistsResponse = (value: unknown): GistsResponse => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is GistResponse => typeof item === 'object' && item !== null
  );
};

const getGist = async (id: string): Promise<Gist> => {
  try {
    const results = await gists.get({ gist_id: id });

    return formatGist(results.data);
  } catch (err) {
    throw prepareError(err as Error);
  }
};

/**
 * Get a list of gists
 */
const getGists = async (starred = false): Promise<Gist[]> => {
  try {
    const results = await gists[starred ? 'listStarred' : 'list']({
      per_page: GISTS_PER_PAGE
    });

    return formatGists(toGistsResponse(results.data));
  } catch (err) {
    throw prepareError(err as Error);
  }
};

const updateGist = async (
  id: string,
  filename: string,
  content: string | null
): Promise<Gist> => {
  try {
    if (!content) {
      content = ' ';
    }
    const results = await gists.update({
      files: { [filename]: { content } },
      gist_id: id
    });

    return formatGist(results.data);
  } catch (err) {
    throw prepareError(err as Error);
  }
};

const configure = (options: { key: string; url: string }): void => {
  const key = options.key || '';
  const url = options.url || GISTS_BASE_URL;
  gists.configure({ key, url });
};

const createGist = async (
  files: { [x: string]: { content: string } },
  description?: string,
  isPublic = true
): Promise<Gist> => {
  try {
    const results = await gists.create({
      description,
      files,
      public: isPublic
    });

    return formatGist(results.data);
  } catch (err) {
    throw prepareError(err as Error);
  }
};

const deleteGist = async (id: string): Promise<void> => {
  try {
    await gists.delete({ gist_id: id });
  } catch (err) {
    throw prepareError(err as Error);
  }
};

const deleteFile = async (id: string, filename: string): Promise<void> => {
  try {
    await gists.update({
      files: { [filename]: { content: '' } },
      gist_id: id
    });
  } catch (err) {
    throw prepareError(err as Error);
  }
};

export {
  configure,
  createGist,
  deleteFile,
  deleteGist,
  getGist,
  getGists,
  updateGist
};
