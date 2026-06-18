import { commands, ExtensionContext, window } from 'vscode';

import { resetState } from '../reset-state.js';
import {
  GistCommands,
  StatusBarCommands
} from '../commands/extension-commands.js';
import { profiles } from '../profiles/index.js';

const executeCommandSpy = jest.spyOn(commands, 'executeCommand');
const showWarningMessageSpy = jest.spyOn(window, 'showWarningMessage');
const resetProfilesSpy = jest.spyOn(profiles, 'reset');

const createContext = (
  update: jest.Mock = jest.fn(async () => undefined)
): ExtensionContext =>
  ({
    globalState: {
      get: jest.fn(),
      update
    }
  }) as unknown as ExtensionContext;

describe('extension reset state', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should skip reset when confirmation is cancelled', async () => {
    expect.assertions(3);

    const update = jest.fn(async () => undefined);
    showWarningMessageSpy.mockResolvedValueOnce(undefined);

    await resetState(createContext(update));

    expect(update).not.toHaveBeenCalled();
    expect(resetProfilesSpy).not.toHaveBeenCalled();
    expect(executeCommandSpy).not.toHaveBeenCalled();
  });

  test('should await state clearing before refreshing commands', async () => {
    expect.assertions(5);

    let resolveUpdate: () => void = () => undefined;
    const firstUpdate = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });
    const update = jest
      .fn()
      .mockReturnValueOnce(firstUpdate)
      .mockResolvedValue(undefined);

    showWarningMessageSpy.mockResolvedValueOnce('Reset');
    resetProfilesSpy.mockResolvedValueOnce(undefined);

    const resetPromise = resetState(createContext(update));
    await Promise.resolve();

    expect(update).toHaveBeenCalledWith('gisttoken', undefined);
    expect(executeCommandSpy).not.toHaveBeenCalled();

    resolveUpdate();
    await resetPromise;

    expect(update).toHaveBeenCalledWith('gist_provider', undefined);
    expect(update).toHaveBeenCalledWith('migrations', undefined);
    expect(executeCommandSpy.mock.calls).toStrictEqual([
      [StatusBarCommands.Update],
      [GistCommands.UpdateAccessKey]
    ]);
  });
});
