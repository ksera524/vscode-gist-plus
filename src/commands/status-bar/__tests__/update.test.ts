import { window } from 'vscode';

import { update } from '../update.js';

const createStatusBarItem = jest.spyOn(window, 'createStatusBarItem');
const createStatusBarItemMock = {
  command: '',
  dispose: jest.fn(),
  show: jest.fn(),
  text: ''
};

const utilsMock = jest.genMockFromModule<Utils>('../../../utils');
const debugMock = jest.fn();
const errorMock = jest.fn();
const getMock = jest.fn(async () => ({ name: 'foo' }) as Services);

createStatusBarItem.mockImplementation(
  () => createStatusBarItemMock as Services
);

describe('update status bar', () => {
  let updateFn: CommandFn;
  beforeEach(() => {
    const profiles = { get: getMock };
    const insights = { exception: jest.fn() };
    const logger = { debug: debugMock, error: errorMock };
    updateFn = update(
      { get: jest.fn() },
      { insights, logger, profiles } as Services,
      utilsMock
    )[1];
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should update the status bar', async () => {
    expect.assertions(2);

    await updateFn();

    expect(createStatusBarItemMock.text).toStrictEqual('GIST [foo]');
    expect(createStatusBarItemMock.command).toStrictEqual(
      'extension.profile.select'
    );
  });

  test('should show "Create Profile" in status bar', async () => {
    expect.assertions(2);

    getMock.mockResolvedValueOnce(undefined);

    await updateFn();

    expect(createStatusBarItemMock.text).toStrictEqual('GIST [Create Profile]');
    expect(createStatusBarItemMock.command).toStrictEqual(
      'extension.profile.create'
    );
  });

  test('should return status bar item as an extra disposable', () => {
    expect.assertions(1);

    const registration = update(
      { get: jest.fn() },
      {
        logger: { debug: debugMock, error: errorMock },
        profiles: { get: getMock }
      } as Services,
      utilsMock
    );

    expect(registration[2]).toStrictEqual([createStatusBarItemMock]);
  });
});
