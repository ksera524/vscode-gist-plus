import { commands } from 'vscode';

import { init } from '../commands.js';

const registerCommandSpy = jest.spyOn(commands, 'registerCommand');

describe('commands init', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should include extra command disposables in cleanup list', () => {
    expect.assertions(3);

    const extraDisposable = { dispose: jest.fn() };
    const commandDisposable = { dispose: jest.fn() };
    registerCommandSpy.mockReturnValueOnce(commandDisposable);

    const result = init(
      { get: jest.fn() },
      { logger: { debug: jest.fn() } } as Services,
      [() => ['extension.test', jest.fn(), [extraDisposable]]]
    );

    expect(result.commandCount).toBe(1);
    expect(result.commands).toStrictEqual([commandDisposable, extraDisposable]);
    expect(registerCommandSpy).toHaveBeenCalledWith(
      'extension.test',
      expect.any(Function)
    );
  });
});
