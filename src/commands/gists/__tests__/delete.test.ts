import { commands, window } from 'vscode';

import { deleteCommand } from '../delete.js';

const deleteGistMock = jest.fn();
const errorMock = jest.fn();
const infoMock = jest.fn();
const utilsMock = jest.genMockFromModule<Utils>('../../../utils');
const executeCommandSpy = jest.spyOn(commands, 'executeCommand');
const showTextDocumentSpy = jest.spyOn(window, 'showTextDocument');

describe('open gist', () => {
  let deleteFn: CommandFn;
  beforeEach(() => {
    const gists = { deleteGist: deleteGistMock };
    const insights = { exception: jest.fn() };
    const logger = { error: errorMock, info: infoMock };
    deleteFn = deleteCommand(
      { get: jest.fn() },
      { gists, insights, logger } as Services,
      utilsMock as Services
    )[1];
    (
      window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }
    ).activeTextEditor = undefined;
    (
      window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }
    ).visibleTextEditors = [];
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

    (
      window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }
    ).activeTextEditor = { document: {} };

    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce('DELETE');
    deleteGistMock.mockRejectedValueOnce(false);

    await deleteFn();
    expect(errorMock.mock.calls.length).toBe(1);
  });
  test('it deletes the open gist', async () => {
    expect.assertions(3);

    (
      window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }
    ).activeTextEditor = { document: { gist: { id: '123' } } };
    (
      window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }
    ).visibleTextEditors = [{ document: { gist: { id: '123' } } }];
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce('DELETE');

    await deleteFn();

    expect(deleteGistMock).toHaveBeenCalledWith('123');
    expect(showTextDocumentSpy).toHaveBeenCalledWith({ gist: { id: '123' } });
    expect(executeCommandSpy).toHaveBeenCalledWith(
      'workbench.action.closeActiveEditor'
    );
  });

  test('it does not delete when confirmation is cancelled', async () => {
    expect.assertions(2);

    (
      window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }
    ).activeTextEditor = { document: { gist: { id: '123' } } };
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce(undefined);

    await deleteFn();

    expect(deleteGistMock).not.toHaveBeenCalled();
    expect(infoMock).toHaveBeenCalledWith('User Aborted Deletion');
  });
});
