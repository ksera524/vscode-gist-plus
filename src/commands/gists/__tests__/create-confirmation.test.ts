import { commands, env, window } from 'vscode';

import type { Gist } from '../../../types/gist';
import { createConfirmation } from '../create-confirmation';

const gistMock: Gist = {
  createdAt: new Date().toISOString(),
  description: 'test',
  fileCount: 1,
  files: {
    'fileone.txt': {
      content: 'test',
      filename: 'fileone.txt',
      language: 'text',
      raw_url: '',
      size: 4,
      type: 'text/plain'
    }
  },
  id: '123',
  name: 'test',
  public: true,
  updatedAt: new Date().toISOString(),
  url: 'https://my.test.com/gisttokengoeshere'
};
const utilsMock = jest.genMockFromModule<Utils>('../../../utils');
const errorMock = jest.fn();

describe('create gist', () => {
  let createConfirmationFn: CommandFn;
  const executeCommandSpy = jest.spyOn(commands, 'executeCommand');
  const windowMock = window as unknown as {
    showInformationMessage: {
      mock: { calls: unknown[][] };
      mockResolvedValueOnce: (value: { title: string }) => void;
    };
  };

  beforeEach(() => {
    const gists = { createGist: jest.fn() };
    const insights = { exception: jest.fn() };
    const logger = { error: errorMock, info: jest.fn() };
    (
      env as unknown as {
        clipboard: { writeText: (...args: unknown[]) => void };
      }
    ).clipboard = {
      writeText: jest.fn()
    };
    createConfirmationFn = createConfirmation(
      { get: jest.fn() },
      { gists, insights, logger } as unknown as Services,
      utilsMock
    )[1];
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('an information message is shown', async () => {
    expect.assertions(1);

    await createConfirmationFn(gistMock);

    expect(windowMock.showInformationMessage.mock.calls[0]).toMatchObject([
      'Gist Created',
      {
        title: 'Open in Browser'
      },
      {
        title: 'Copy Gist URL to Clipboard'
      }
    ]);
  });

  test('when something goes wrong do not throw but log', async () => {
    expect.assertions(2);

    let error: Error | undefined;
    try {
      await createConfirmationFn(undefined);
    } catch (err) {
      error = err as Error;
    }

    expect(errorMock.mock.calls).toHaveLength(1);
    expect(error).toBeUndefined();
  });

  test('executes open in browser command when selected', async () => {
    expect.assertions(1);
    windowMock.showInformationMessage.mockResolvedValueOnce({
      title: 'Open in Browser'
    });

    await createConfirmationFn(gistMock);

    expect(executeCommandSpy).toHaveBeenCalledWith(
      'extension.gist.openInBrowser',
      gistMock
    );
  });

  test('copies gist url when selected', async () => {
    expect.assertions(1);
    windowMock.showInformationMessage.mockResolvedValueOnce({
      title: 'Copy Gist URL to Clipboard'
    });

    await createConfirmationFn(gistMock);

    expect(
      (
        env as unknown as {
          clipboard: { writeText: (...args: unknown[]) => void };
        }
      ).clipboard.writeText
    ).toHaveBeenCalledWith(gistMock.url);
  });
});
