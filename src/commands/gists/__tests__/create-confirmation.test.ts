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
  const showInformationMessageSpy = jest.spyOn(
    window,
    'showInformationMessage'
  );

  beforeEach(() => {
    const gists: GistService = {
      configure: () => {
        // noop
      },
      createGist: async () => gistMock,
      deleteFile: async () => {
        // noop
      },
      deleteGist: async () => {
        // noop
      },
      getGist: async () => gistMock,
      getGists: async () => [gistMock],
      updateGist: async () => gistMock
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
    (
      env as { clipboard: { writeText: (...args: unknown[]) => void } }
    ).clipboard = {
      writeText: jest.fn()
    };
    createConfirmationFn = createConfirmation(
      { get: jest.fn() },
      { gists, insights, logger, profiles } as Services,
      utilsMock
    )[1];
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('an information message is shown', async () => {
    expect.assertions(1);

    await createConfirmationFn(gistMock);

    expect(showInformationMessageSpy.mock.calls[0]).toMatchObject([
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

  test('logs invalid gist payload object without throwing', async () => {
    expect.assertions(2);

    let error: Error | undefined;
    try {
      await createConfirmationFn({ url: gistMock.url });
    } catch (err) {
      error = err as Error;
    }

    expect(errorMock.mock.calls).toHaveLength(1);
    expect(error).toBeUndefined();
  });

  test('executes open in browser command when selected', async () => {
    expect.assertions(1);
    showInformationMessageSpy.mockResolvedValueOnce({
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
    showInformationMessageSpy.mockResolvedValueOnce({
      title: 'Copy Gist URL to Clipboard'
    });

    await createConfirmationFn(gistMock);

    expect(
      (env as { clipboard: { writeText: (...args: unknown[]) => void } })
        .clipboard.writeText
    ).toHaveBeenCalledWith(gistMock.url);
  });
});
