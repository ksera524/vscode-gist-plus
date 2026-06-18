import { commands, window } from 'vscode';

import { create } from '../create.js';

const utilsMock = jest.genMockFromModule<Utils>('../../../utils');
const errorMock = jest.fn();
const debugMock = jest.fn();
const addMock = jest.fn();

const executeCommandSpy = jest.spyOn(commands, 'executeCommand');
const showInformationMessageSpy = jest.spyOn(window, 'showInformationMessage');

describe('create profile', () => {
  let createFn: CommandFn;
  beforeEach(() => {
    const insights = { exception: jest.fn() };
    const logger = { debug: debugMock, error: errorMock };
    const profiles = { add: addMock };
    createFn = create(
      { get: jest.fn() },
      { insights, logger, profiles } as Services,
      utilsMock as Services
    )[1];
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should create a new profile', async () => {
    expect.assertions(4);

    showInformationMessageSpy.mockImplementationOnce(
      (_prompt: string, _options: object, ...items: any[]) => {
        const item = items[items.length - 1];

        return Promise.resolve(item);
      }
    );
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce('test url');
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce('test key');
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce('test name');

    await createFn();

    expect(addMock).toHaveBeenCalledWith(
      'test name',
      'test key',
      'test url',
      true
    );
    expect(utilsMock.input.prompt).toHaveBeenNthCalledWith(
      2,
      'Enter your access token',
      '',
      { password: true }
    );
    expect(executeCommandSpy).toHaveBeenNthCalledWith(
      1,
      'extension.status.update'
    );
    expect(executeCommandSpy).toHaveBeenNthCalledWith(
      2,
      'extension.gist.updateAccessKey'
    );
  });

  test('should trim profile fields before saving', async () => {
    expect.assertions(1);

    showInformationMessageSpy.mockImplementationOnce(
      (_prompt: string, _options: object, ...items: any[]) => {
        const item = items[items.length - 1];

        return Promise.resolve(item);
      }
    );
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce(' test url ');
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce(' test key ');
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce(' test name ');

    await createFn();

    expect(addMock).toHaveBeenCalledWith(
      'test name',
      'test key',
      'test url',
      true
    );
  });

  test('should reject blank names after trimming', async () => {
    expect.assertions(2);

    showInformationMessageSpy.mockImplementationOnce(
      (_prompt: string, _options: object, ...items: any[]) => {
        const item = items[items.length - 1];

        return Promise.resolve(item);
      }
    );
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce('test url');
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce('test key');
    (utilsMock.input.prompt as jest.Mock).mockResolvedValueOnce('   ');

    await createFn();

    expect(addMock).not.toHaveBeenCalled();
    expect(debugMock).toHaveBeenCalledWith(
      'User Aborted Create Profile at "name"'
    );
  });

  test('when platform selection is cancelled do not throw or log an error', async () => {
    expect.assertions(2);
    showInformationMessageSpy.mockResolvedValueOnce(undefined);

    let error: any;
    try {
      await createFn();
    } catch (err) {
      error = err;
    }

    expect(errorMock.mock.calls).toHaveLength(0);
    expect(error).toBeUndefined();
  });
});
