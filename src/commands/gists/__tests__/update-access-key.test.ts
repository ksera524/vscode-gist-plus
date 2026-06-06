import { toGistServiceOptions, updateAccessKey } from '../update-access-key.js';

const utilsMock = jest.genMockFromModule<Utils>('../../../utils');
const configureGistsMock = jest.fn();

describe('update access key', () => {
  let updateAccessKeyFn: CommandFn;
  beforeEach(() => {
    const gists = { configure: configureGistsMock };
    const profiles = {
      get: jest.fn(() => ({ key: '123', url: 'https://test.com' }))
    };
    const insights = { track: jest.fn() };
    const logger = { debug: jest.fn() };
    updateAccessKeyFn = updateAccessKey(
      { get: jest.fn() },
      { gists, insights, logger, profiles } as Services,
      utilsMock as Services
    )[1];
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should update gist access key', () => {
    expect.assertions(2);

    updateAccessKeyFn();

    expect(configureGistsMock.mock.calls).toHaveLength(1);
    expect(configureGistsMock.mock.calls[0][0]).toStrictEqual({
      key: '123',
      rejectUnauthorized: true,
      url: 'https://test.com'
    });
  });
  test('should update gist access key to undefined when no access key is provided', () => {
    expect.assertions(2);
    const gists = { configure: configureGistsMock };
    const profiles = {
      get: jest.fn(() => undefined)
    };
    const insights = { track: jest.fn() };
    const logger = { debug: jest.fn() };
    updateAccessKeyFn = updateAccessKey(
      { get: jest.fn() },
      { gists, insights, logger, profiles } as Services,
      utilsMock as Services
    )[1];

    updateAccessKeyFn();

    expect(configureGistsMock.mock.calls).toHaveLength(1);
    expect(configureGistsMock.mock.calls[0][0]).toStrictEqual({
      key: undefined,
      rejectUnauthorized: undefined,
      url: undefined
    });
  });
  test('should preserve rejectUnauthorized override when false', () => {
    expect.assertions(1);

    expect(
      toGistServiceOptions(
        { active: true, key: '123', name: 'test', url: 'https://test.com' },
        { rejectUnauthorized: false }
      )
    ).toStrictEqual({
      key: '123',
      rejectUnauthorized: false,
      url: 'https://test.com'
    });
  });
});
