import { window } from 'vscode';

import { deleteFile } from '../delete-file';

const deleteFileMock = jest.fn();
const errorMock = jest.fn();
const utilsMock = jest.genMockFromModule<Utils>('../../../utils');

describe('open gist', () => {
  let deleteFileFn: CommandFn;
  beforeEach(() => {
    const gists = { deleteFile: deleteFileMock };
    const insights = { exception: jest.fn() };
    const logger = { error: errorMock, info: jest.fn() };
    deleteFileFn = deleteFile(
      { get: jest.fn() },
      { gists, insights, logger } as Services,
      utilsMock as Services
    )[1];
    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = undefined;
    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).visibleTextEditors = [];
    (utilsMock.files.extractTextDocumentDetails as jest.Mock).mockReturnValue({
      filename: 'foo',
      id: '123'
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('what happens when errors occur', async () => {
    expect.assertions(1);

    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = { document: {} };

    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce('DELETE');
    deleteFileMock.mockRejectedValueOnce(false);

    await deleteFileFn();
    expect(errorMock.mock.calls.length).toBe(1);
  });
  test('it deletes the open file', async () => {
    expect.assertions(1);

    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = { document: { gist: { id: '123' } } };
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce('DELETE');

    await deleteFileFn();

    expect(deleteFileMock).toHaveBeenCalledWith('123', 'foo');
  });
});
