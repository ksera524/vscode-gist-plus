import { commands, window } from 'vscode';

import { TMP_DIRECTORY_PREFIX } from '../../../constants';
import type { Gist } from '../../../types/gist';
import { openInBrowser } from '../open-in-browser';

jest.mock('fs');
jest.mock('path');

const getGistsMock = jest.fn(() => [
  {
    createdAt: new Date(),
    description: 'some markdown file',
    fileCount: 1,
    files: { 'file-one.md': { content: 'test' } },
    id: '123',
    name: 'gist one',
    public: true,
    updatedAt: new Date(),
    url: 'gist-one-url'
  },
  {
    createdAt: new Date(),
    description: 'some markdown file',
    fileCount: 1,
    files: { 'file-two.md': { content: 'test' } },
    id: '123',
    name: 'gist two',
    public: true,
    updatedAt: new Date(),
    url: 'gist-two-url'
  }
]);
const getGistMock = jest.fn(
  (id: string): Promise<Gist> =>
    Promise.resolve({
      createdAt: new Date().toISOString(),
      description: 'some markdown file',
      fileCount: 1,
      files: {
        'file-one.md': {
          content: 'test',
          filename: 'file-one.md',
          language: 'markdown',
          raw_url: '',
          size: 4,
          type: 'text/markdown'
        }
      },
      id,
      name: 'test',
      public: true,
      updatedAt: new Date().toISOString(),
      url: 'test-url'
    })
);
const utilsMock = jest.genMockFromModule<Utils>('../../../utils');
const errorMock = jest.fn();

const executeCommandSpy = jest.spyOn(commands, 'executeCommand');

describe('open favorite gist', () => {
  let openInBrowserFn: CommandFn;
  beforeEach(() => {
    const gists: GistService = {
      configure: () => {
        // noop
      },
      createGist: async () => ({}) as Gist,
      deleteFile: async () => {
        // noop
      },
      deleteGist: async () => {
        // noop
      },
      getGist: getGistMock,
      getGists: async () => getGistsMock(),
      updateGist: async () => ({}) as Gist
    };
    const insights = { exception: jest.fn() };
    const logger: Logger = {
      debug: jest.fn(),
      error: errorMock,
      info: jest.fn(),
      setLevel: jest.fn(),
      setOutput: jest.fn(),
      warn: jest.fn()
    };
    const profiles: Profiles = {
      add: async () => {
        // noop
      },
      configure: () => {
        // noop
      },
      get: () => undefined,
      getAll: () => [],
      reset: async () => {
        // noop
      }
    };
    openInBrowserFn = openInBrowser(
      { get: jest.fn() },
      { gists, insights, logger, profiles } as Services,
      utilsMock
    )[1];
    (window as { activeTextEditor: unknown }).activeTextEditor = undefined;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('that a error is shown when no open documents', async () => {
    expect.assertions(1);

    const errorSpy = jest.spyOn(utilsMock.notify, 'error');

    await openInBrowserFn();
    expect(errorSpy.mock.calls.length).toBe(1);
  });
  test('it opens a browser', async () => {
    expect.assertions(2);

    (
      utilsMock.files.extractTextDocumentDetails as jest.Mock
    ).mockImplementation(() => ({ id: '123456789abcdefg', url: 'test-url' }));

    const codeBlock = {
      fileName: `${TMP_DIRECTORY_PREFIX}_123456789abcdefg_random_string/test-file-name.md`,
      getText: jest.fn(() => 'test-file-content')
    };

    const editor = {
      document: codeBlock,
      selection: { isEmpty: true }
    };

    (window as { activeTextEditor: unknown }).activeTextEditor = editor;

    await openInBrowserFn();

    expect(getGistMock).toHaveBeenCalledWith('123456789abcdefg');
    expect(executeCommandSpy).toHaveBeenCalledWith('vscode.open', 'test-url');
  });
});
