import { commands, window } from 'vscode';

import { open } from '../open.js';

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
    updatedAt: new Date()
  },
  {
    createdAt: new Date(),
    description: 'some markdown file',
    fileCount: 1,
    files: { 'file-two.md': { content: 'test' } },
    id: '123',
    name: 'gist two',
    public: true,
    updatedAt: new Date()
  }
]);
const getGistMock = jest.fn((id: string) => ({
  createdAt: new Date(),
  description: 'some markdown file',
  fileCount: 1,
  files: { 'file-one.md': { content: 'test' } },
  id,
  name: 'test',
  public: true,
  updatedAt: new Date()
}));
const utilsMock = jest.genMockFromModule<Utils>('../../../utils');
const errorMock = jest.fn();

const executeCommandSpy = jest.spyOn(commands, 'executeCommand');

describe('open gist', () => {
  let openFn: CommandFn;
  beforeEach(() => {
    const gists = { getGists: getGistsMock, getGist: getGistMock };
    const insights = { exception: jest.fn() };
    const logger = { error: errorMock, info: jest.fn() };
    openFn = open(
      { get: jest.fn() },
      { gists, insights, logger } as Services,
      utilsMock as Services
    )[1];
    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = undefined;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('what happens when errors occur', async () => {
    expect.assertions(1);

    (utilsMock.input.quickPick as jest.Mock).mockRejectedValueOnce(false);

    await openFn();
    expect(errorMock.mock.calls.length).toBe(1);
  });
  test('it opens the quickpick pane', async () => {
    expect.assertions(3);

    await openFn();

    expect((utilsMock.input.quickPick as jest.Mock).mock.calls.length).toBe(1);

    const firstGist = (utilsMock.input.quickPick as jest.Mock).mock.calls[0][0][0];
    const secondGist = (utilsMock.input.quickPick as jest.Mock).mock.calls[0][0][1];

    expect(firstGist.name).toBe('gist one');
    expect(secondGist.name).toBe('gist two');
  });
  test('it opens a document', async () => {
    expect.assertions(1);

    (utilsMock.input.quickPick as jest.Mock).mockResolvedValue({
      block: {
        id: '123'
      },
      label: 'foo'
    });

    await openFn();

    expect(executeCommandSpy).toHaveBeenCalledWith(
      'workbench.action.keepEditor'
    );
  });
});
