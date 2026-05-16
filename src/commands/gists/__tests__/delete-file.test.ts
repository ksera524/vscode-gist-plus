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
      { gists, insights, logger } as unknown,
      utilsMock as unknown
    )[1];
    (<unknown>window).activeTextEditor = undefined;
    (<unknown>window).visibleTextEditors = [];
    (<unknown>utilsMock.files.extractTextDocumentDetails).mockReturnValue({
      filename: 'foo',
      id: '123'
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('what happens when errors occur', async () => {
    expect.assertions(1);

    (<unknown>window).activeTextEditor = { document: {} };

    (<unknown>utilsMock.input.prompt).mockResolvedValueOnce('DELETE');
    deleteFileMock.mockRejectedValueOnce(false);

    await deleteFileFn();
    expect(errorMock.mock.calls.length).toBe(1);
  });
  test('it deletes the open file', async () => {
    expect.assertions(1);

    (<unknown>window).activeTextEditor = { document: { gist: { id: '123' } } };
    (<unknown>utilsMock.input.prompt).mockResolvedValueOnce('DELETE');

    await deleteFileFn();

    expect(deleteFileMock).toHaveBeenCalledWith('123', 'foo');
  });
});
