import { TMP_DIRECTORY_PREFIX } from '../../constants.js';
import type { Gist } from '../../types/gist.js';
import { onDidSaveTextDocument } from '../on-did-save-text-document.js';

const errorMock = jest.fn();
const exceptionMock = jest.fn();
const infoMock = jest.fn();
const trackMock = jest.fn();
const updateGistMock = jest.fn(
  (id: string, filename: string, content: string) =>
    Promise.resolve({ gist_id: id, files: { [filename]: { content } } })
);
const utilsMock = jest.genMockFromModule<Utils>('../../utils');

describe('onDidSaveTextDocument', () => {
  let onDidSaveTextDocumentFn: ListenerFn;
  const filesMock = utilsMock.files as {
    extractTextDocumentDetails: {
      mockImplementation: (fn: (...args: unknown[]) => unknown) => void;
    };
  };

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
      getGist: async () => ({}) as Gist,
      getGists: async () => [],
      updateGist: updateGistMock
    };
    const insights = { exception: exceptionMock, track: trackMock };
    const logger: Logger = {
      debug: jest.fn(),
      error: errorMock,
      info: infoMock,
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
    const services = { gists, insights, logger, profiles } as Services;
    onDidSaveTextDocumentFn = onDidSaveTextDocument(
      { get: jest.fn() },
      services,
      utilsMock
    )[1];
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should save', async () => {
    expect.assertions(3);

    filesMock.extractTextDocumentDetails.mockImplementation(() => ({
      content: 'test-file-content',
      filename: 'test-file-name.md',
      id: '123',
      language: 'unknown'
    }));

    await onDidSaveTextDocumentFn({
      fileName: `${TMP_DIRECTORY_PREFIX}_123456789abcdefg_random_string/test-file-name.md`,
      getText: jest.fn(() => 'test-file-content')
    });

    expect(updateGistMock.mock.calls.length).toBe(1);
    expect(updateGistMock.mock.calls[0][0]).toBe('123');
    expect(updateGistMock.mock.calls[0][1]).toStrictEqual('test-file-name.md');
  });
  test('should handle errors', async () => {
    expect.assertions(2);

    updateGistMock.mockRejectedValueOnce(new Error('Not Found'));

    const gistDocument = {
      fileName: `${TMP_DIRECTORY_PREFIX}_123456789abcdefg_random_string/test-file-name.md`,
      getText: jest.fn(() => 'test-file-content')
    };

    let error: Error | undefined;
    try {
      await onDidSaveTextDocumentFn(gistDocument);
    } catch (err) {
      error = err as Error;
    }

    expect(error).toBeUndefined();
    expect(errorMock).toHaveBeenCalledWith('onDidSaveTextDocument > Not Found');
  });

  test('should ignore invalid payload and not throw', async () => {
    expect.assertions(2);

    await expect(onDidSaveTextDocumentFn(undefined)).resolves.toBeUndefined();
    expect(errorMock).toHaveBeenCalledWith(
      'onDidSaveTextDocument > Invalid document payload'
    );
  });
});
