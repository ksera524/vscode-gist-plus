import { window } from 'vscode';

import { deleteCommand } from '../delete.js';

const deleteGistMock = jest.fn();
const errorMock = jest.fn();
const utilsMock = jest.genMockFromModule<Utils>('../../../utils');

describe('open gist', () => {
  let deleteFn: CommandFn;
  beforeEach(() => {
    const gists = { deleteGist: deleteGistMock };
    const insights = { exception: jest.fn() };
    const logger = { error: errorMock, info: jest.fn() };
    deleteFn = deleteCommand(
      { get: jest.fn() },
      { gists, insights, logger } as Services,
      utilsMock as Services
    )[1];
    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = undefined;
    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).visibleTextEditors = [];
    (utilsMock.files.extractTextDocumentDetails as jest.Mock).mockReturnValue({
      id: '123'
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should log error when no editor', async () => {
    expect.assertions(1);

    (window.activeTextEditor as TextEditor | undefined) = undefined;

    await deleteFn();
    expect(errorMock.mock.calls.length).toBe(1);
  });
  test('what happens when errors occur', async () => {
    expect.assertions(1);

    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = { document: {} };

    deleteGistMock.mockRejectedValueOnce(false);

    await deleteFn();
    expect(errorMock.mock.calls.length).toBe(1);
  });
  test('it deletes the open gist', async () => {
    expect.assertions(1);

    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = { document: { gist: { id: '123' } } };

    await deleteFn();

    expect(deleteGistMock).toHaveBeenCalledWith('123');
  });
});
