import { TMP_DIRECTORY_PREFIX } from '../../constants';
import { onDidSaveTextDocument } from '../on-did-save-text-document';

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
  const filesMock = utilsMock.files as unknown as {
    extractTextDocumentDetails: {
      mockImplementation: (fn: (...args: unknown[]) => unknown) => void;
    };
  };

  beforeEach(() => {
    const gists = { updateGist: updateGistMock };
    const insights = { exception: exceptionMock, track: trackMock };
    const logger = { error: errorMock, info: infoMock };
    onDidSaveTextDocumentFn = onDidSaveTextDocument(
      { get: jest.fn() },
      { gists, insights, logger } as unknown as Services,
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
