import { env } from 'vscode';

import { GISTS_BASE_URL, GISTS_PER_PAGE } from '../constants.js';
import type { Gist, GistFile } from '../types/gist.js';

import { gists } from './gists-service.js';

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
  description: string | null;
  files: { [x: string]: ApiGistFile };
  html_url?: string;
  id: string;
  public: boolean;
  updated_at: string;
  url?: string;
}

type GistsResponse = GistResponse[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isGistResponse = (value: unknown): value is GistResponse => {
  if (!isRecord(value)) {
    return false;
  }

  const hasUrl =
    typeof value['html_url'] === 'string' || typeof value['url'] === 'string';

  return (
    typeof value['created_at'] === 'string' &&
    (typeof value['description'] === 'string' ||
      value['description'] === null) &&
    isRecord(value['files']) &&
    hasUrl &&
    typeof value['id'] === 'string' &&
    typeof value['public'] === 'boolean' &&
    typeof value['updated_at'] === 'string'
  );
};

const prepareError = (err: Error): Error => {
  try {
    return new Error(
      (JSON.parse(err && err.message) || { message: 'unknown' }).message
    );
  } catch {
    return err;
  }
};

const normalizeCreateFiles = (files?: {
  [x: string]: { content: string };
}): { [x: string]: { content: string } } => {
  const normalized =
    files && typeof files === 'object'
      ? Object.fromEntries(
          Object.entries(files)
            .map(
              ([filename, file]) =>
                [filename.trim(), file] as [string, { content: string }]
            )
            .filter(
              ([filename, file]) =>
                Boolean(filename) &&
                Boolean(file) &&
                typeof file.content === 'string'
            )
            .map(([filename, file]) => [
              filename,
              { content: file.content || ' ' }
            ])
        )
      : {};

  if (Object.keys(normalized).length === 0) {
    return { 'untitled.txt': { content: ' ' } };
  }

  return normalized;
};

const definedGistFileEntries = (files: {
  [x: string]: ApiGistFile;
}): [string, ApiGistFile][] =>
  Object.entries(files).filter((entry): entry is [string, ApiGistFile] =>
    Boolean(entry[1])
  );

const normalizeGistFile = (file: ApiGistFile): GistFile => ({
  content: typeof file.content === 'string' ? file.content : '',
  ...(typeof file.content === 'string' ? {} : { contentLoaded: false }),
  ...(typeof file.filename === 'string' ? { filename: file.filename } : {}),
  ...(typeof file.language === 'string' ? { language: file.language } : {}),
  ...(typeof file.raw_url === 'string' ? { raw_url: file.raw_url } : {}),
  ...(typeof file.size === 'number' ? { size: file.size } : {}),
  ...(typeof file.type === 'string' ? { type: file.type } : {})
});

const markContentLoaded = (file: GistFile, content: string): GistFile => {
  const loadedFile = { ...file, content };
  delete loadedFile.contentLoaded;

  return loadedFile;
};

const hydrateGistFile = async (file: ApiGistFile): Promise<GistFile> => {
  if (typeof file.content === 'string') {
    return normalizeGistFile(file);
  }

  if (typeof file.raw_url !== 'string') {
    return normalizeGistFile(file);
  }

  const response = await gists.raw(file.raw_url);
  const normalized = normalizeGistFile(file);

  return typeof response.data === 'string'
    ? markContentLoaded(normalized, response.data)
    : normalized;
};

const toGist = async (g: GistResponse, hydrate = false): Promise<Gist> => {
  const fileEntries = hydrate
    ? await Promise.all(
        definedGistFileEntries(g.files).map(async ([key, file]) => [
          key,
          await hydrateGistFile(file)
        ])
      )
    : definedGistFileEntries(g.files).map(([key, file]) => [
        key,
        normalizeGistFile(file)
      ]);

  return {
    createdAt: new Intl.DateTimeFormat(env.language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(g.created_at)),
    description: g.description || '',
    fileCount: Object.keys(g.files).length,
    files: Object.fromEntries(fileEntries),
    id: g.id,
    name: g.description || Object.keys(g.files)[0] || '',
    public: g.public,
    updatedAt: new Intl.DateTimeFormat(env.language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(g.updated_at)),
    url: g.html_url || g.url || ''
  };
};

const formatGist = async (gist: unknown, hydrate = false): Promise<Gist> => {
  if (!isGistResponse(gist)) {
    throw new Error('Invalid gist payload');
  }

  return toGist(gist, hydrate);
};

const formatGists = (gistList: GistsResponse): Promise<Gist[]> =>
  Promise.all(gistList.map((gist) => formatGist(gist)));

const toGistsResponse = (value: unknown): GistsResponse => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isGistResponse);
};

const getGist = async (id: string): Promise<Gist> => {
  try {
    const results = await gists.get({ gist_id: id });

    return formatGist(results.data, true);
  } catch (err) {
    throw prepareError(err as Error);
  }
};

const listGistPage = (starred: boolean, page: number) =>
  gists[starred ? 'listStarred' : 'list']({
    page,
    per_page: GISTS_PER_PAGE
  });

/**
 * Get a list of gists
 */
const getGists = async (starred = false): Promise<Gist[]> => {
  try {
    const pages: GistResponse[] = [];
    let page = 1;

    while (true) {
      const results = await listGistPage(starred, page);
      const pageData = toGistsResponse(results.data);
      pages.push(...pageData);

      if (pageData.length < GISTS_PER_PAGE) {
        break;
      }

      page += 1;
    }

    return formatGists(pages);
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

const configure = (options: GistServiceOptions): void => {
  const key = options.key || '';
  const url = options.url || GISTS_BASE_URL;
  gists.configure({
    key,
    rejectUnauthorized: options.rejectUnauthorized,
    url
  });
};

const createGist = async (
  files: { [x: string]: { content: string } },
  description?: string,
  isPublic = true
): Promise<Gist> => {
  try {
    const normalizedFiles = normalizeCreateFiles(files);
    const results = await gists.create({
      description,
      files: normalizedFiles,
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
      files: { [filename]: null },
      gist_id: id
    } as unknown as Parameters<typeof gists.update>[0]);
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
  normalizeCreateFiles,
  toGist,
  updateGist
};
