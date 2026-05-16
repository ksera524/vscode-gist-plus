import { commands, window } from 'vscode';

import { TMP_DIRECTORY_PREFIX } from '../../../constants';
import { create } from '../create';

jest.mock('fs');
jest.mock('path');

const createGistMock = jest.fn(
  (
    files: { [x: string]: { content: string } },
    description: string,
    isPublic: boolean
  ) => ({
    createdAt: new Date(),
    description,
    fileCount: 1,
    files,
    id: '123',
    name: description,
    public: isPublic,
    updatedAt: new Date()
  })
);
const utilsMock = jest.genMockFromModule<Utils>('../../../utils');
(utilsMock.files.getFileName as jest.Mock).mockImplementation(
  (doc: { fileName: string }): any => doc.fileName.split('/').pop()
);
const errorMock = jest.fn();

const executeCommandSpy = jest.spyOn(commands, 'executeCommand');

describe('create gist', () => {
  let createFn: CommandFn;
  const configGetMock = jest.fn();
  beforeEach(() => {
    const gists = { createGist: createGistMock };
    const insights = { exception: jest.fn() };
    const logger = { error: errorMock };
    createFn = create(
      { get: configGetMock },
      { gists, insights, logger } as Services,
      utilsMock as Services
    )[1];
    configGetMock.mockImplementation((key: string) => {
      if (key === 'maxFiles') {
        return 10;
      }

      return false;
    });
    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = undefined;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('a prompt is called to enter a filename', async () => {
    expect.assertions(2);

    (utilsMock.input.prompt as jest.Mock).mockImplementation(
      (_msg: string, defaultValue: string) => Promise.resolve(defaultValue)
    );

    const codeBlock = {
      fileName: `${TMP_DIRECTORY_PREFIX}_123456789abcdefg_random_string/test-file-name.md`,
      getText: jest.fn(() => 'test-file-content')
    };

    const editor = {
      document: codeBlock,
      selection: { isEmpty: true }
    };

    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = editor;

    await createFn();

    expect(utilsMock.input.prompt).toHaveBeenCalledTimes(3);
    expect(utilsMock.input.prompt).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('Enter filename'),
      expect.stringMatching('test-file-name.md')
    );
  });

  test('should create a code block and open the files', async () => {
    expect.assertions(2);

    (utilsMock.input.prompt as jest.Mock).mockImplementation(
      (_msg: string, defaultValue: string) => Promise.resolve(defaultValue)
    );

    const codeBlock = {
      fileName: `${TMP_DIRECTORY_PREFIX}_123456789abcdefg_random_string/test-file-name.md`,
      getText: jest.fn(() => 'test-file-content')
    };

    const editor = {
      document: codeBlock,
      selection: { isEmpty: true }
    };

    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = editor;

    await createFn();

    expect(editor.document.getText.mock.calls).toHaveLength(1);
    expect(executeCommandSpy.mock.calls[0][0]).toStrictEqual(
      'workbench.action.keepEditor'
    );
  });

  test('when something goes wrong do not throw but log', async () => {
    expect.assertions(2);

    let error: any;
    try {
      await createFn();
    } catch (err) {
      error = err;
    }

    expect(errorMock.mock.calls).toHaveLength(1);
    expect(error).toBeUndefined();
  });

  test('uses first visible editor when active editor is unavailable', async () => {
    expect.assertions(1);

    (utilsMock.input.prompt as jest.Mock).mockImplementation(
      (_msg: string, defaultValue: string) =>
        Promise.resolve(defaultValue || '')
    );

    const fallbackEditor = {
      document: {
        fileName: `${TMP_DIRECTORY_PREFIX}_fallback_random_string/test-fallback.md`,
        getText: jest.fn(() => 'fallback-content')
      },
      selection: { isEmpty: true }
    };

    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = undefined;
    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).visibleTextEditors = [fallbackEditor];

    await createFn();

    expect(createGistMock).toHaveBeenCalledWith(
      { 'test-fallback.md': { content: 'fallback-content' } },
      '',
      true
    );
  });

  test('uses selection when there is an active selection', async () => {
    expect.assertions(2);
    (utilsMock.input.prompt as jest.Mock).mockImplementation(
      (_msg: string, defaultValue: string) => Promise.resolve(defaultValue)
    );

    const selection = { isEmpty: false };
    const codeBlock = {
      fileName: `${TMP_DIRECTORY_PREFIX}_123456789abcdefg_random_string/test-file-name.md`,
      getText: jest.fn(() => 'selected-text')
    };

    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = {
      document: codeBlock,
      selection
    };

    await createFn();

    expect(codeBlock.getText).toHaveBeenCalledWith(selection);
    expect(createGistMock).toHaveBeenCalledWith(
      { 'test-file-name.md': { content: 'selected-text' } },
      undefined,
      true
    );
  });

  test('defaults to private gist when defaultPrivate is true', async () => {
    expect.assertions(1);
    configGetMock.mockImplementation((key: string) => {
      if (key === 'maxFiles') {
        return 10;
      }

      return key === 'defaultPrivate';
    });
    (utilsMock.input.prompt as jest.Mock).mockImplementation(
      (msg: string, defaultValue: string) => {
        if (msg === 'Public? Y = Yes, N = No') {
          return Promise.resolve('');
        }

        return Promise.resolve(defaultValue || '');
      }
    );

    const codeBlock = {
      fileName: `${TMP_DIRECTORY_PREFIX}_123456789abcdefg_random_string/test-file-name.md`,
      getText: jest.fn(() => 'test-file-content')
    };

    (window as { activeTextEditor?: unknown; visibleTextEditors?: unknown[] }).activeTextEditor = {
      document: codeBlock,
      selection: { isEmpty: true }
    };

    await createFn();

    expect(createGistMock).toHaveBeenLastCalledWith(
      { 'test-file-name.md': { content: 'test-file-content' } },
      '',
      false
    );
  });
});
