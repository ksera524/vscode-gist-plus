import fc from 'fast-check';
import type { OutputChannel } from 'vscode';

import { Levels, createLogger, logger } from '../index.js';

const appendLineMock = jest.fn();

describe('Logger tests', () => {
  describe('Debug Level', () => {
    let debugLogger: any;

    beforeEach(() => {
      debugLogger = logger;
      debugLogger.setLevel(Levels.DEBUG);
      debugLogger.setOutput({ appendLine: appendLineMock });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('#debug', () => {
      expect.assertions(2);

      debugLogger.debug('foo on the debug');

      expect(appendLineMock.mock.calls.length).toBe(1);
      expect(appendLineMock.mock.calls[0]).toMatchObject([
        'vscode-gist>debug: foo on the debug'
      ]);
    });
    test('#error', () => {
      expect.assertions(2);

      debugLogger.error('foo on the error');

      expect(appendLineMock.mock.calls.length).toBe(1);
      expect(appendLineMock.mock.calls[0]).toMatchObject([
        'vscode-gist>error: foo on the error'
      ]);
    });
    test('#info', () => {
      expect.assertions(2);

      debugLogger.info('foo on the info');

      expect(appendLineMock.mock.calls.length).toBe(1);
      expect(appendLineMock.mock.calls[0]).toMatchObject([
        'vscode-gist>info: foo on the info'
      ]);
    });
    test('#warn', () => {
      expect.assertions(2);

      debugLogger.warn('foo on the warn');

      expect(appendLineMock.mock.calls.length).toBe(1);
      expect(appendLineMock.mock.calls[0]).toMatchObject([
        'vscode-gist>warn: foo on the warn'
      ]);
    });
  });
  describe('Info Level', () => {
    let infoLogger: any;
    beforeEach(() => {
      infoLogger = logger;
      infoLogger.setLevel(Levels.INFO);
      infoLogger.setOutput({ appendLine: appendLineMock });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('#debug', () => {
      expect.assertions(1);

      infoLogger.debug('foo on the debug');

      expect(appendLineMock.mock.calls.length).toBe(0);
    });
    test('#info', () => {
      expect.assertions(1);

      infoLogger.info('foo on the info');

      expect(appendLineMock.mock.calls.length).toBe(1);
    });
    test('#warn', () => {
      expect.assertions(1);

      infoLogger.warn('foo on the warn');

      expect(appendLineMock.mock.calls.length).toBe(1);
    });
    test('#error', () => {
      expect.assertions(1);

      infoLogger.error('foo on the error');

      expect(appendLineMock.mock.calls.length).toBe(1);
    });
  });
  describe('Warn Level', () => {
    let warnLogger: any;
    beforeEach(() => {
      warnLogger = logger;
      warnLogger.setLevel(Levels.WARN);
      warnLogger.setOutput({ appendLine: appendLineMock });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('#debug', () => {
      expect.assertions(1);

      warnLogger.debug('foo on the debug');

      expect(appendLineMock.mock.calls.length).toBe(0);
    });
    test('#info', () => {
      expect.assertions(1);

      warnLogger.info('foo on the info');

      expect(appendLineMock.mock.calls.length).toBe(0);
    });
    test('#warn', () => {
      expect.assertions(1);

      warnLogger.warn('foo on the warn');

      expect(appendLineMock.mock.calls.length).toBe(1);
    });
    test('#error', () => {
      expect.assertions(1);

      warnLogger.error('foo on the error');

      expect(appendLineMock.mock.calls.length).toBe(1);
    });
    describe('Error Level', () => {
      let errorLogger: any;
      beforeEach(() => {
        errorLogger = logger;
        errorLogger.setLevel(Levels.ERROR);
        errorLogger.setOutput({ appendLine: appendLineMock });
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      test('#debug', () => {
        expect.assertions(1);

        errorLogger.debug('foo on the debug');

        expect(appendLineMock.mock.calls.length).toBe(0);
      });
      test('#info', () => {
        expect.assertions(1);

        errorLogger.info('foo on the info');

        expect(appendLineMock.mock.calls.length).toBe(0);
      });
      test('#warn', () => {
        expect.assertions(1);

        errorLogger.warn('foo on the warn');

        expect(appendLineMock.mock.calls.length).toBe(0);
      });
      test('#error', () => {
        expect.assertions(1);

        errorLogger.error('foo on the error');

        expect(appendLineMock.mock.calls.length).toBe(1);
      });
    });
  });

  describe('PBT invariants', () => {
    test('log output count matches threshold policy (PBT)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(Levels.DEBUG, Levels.INFO, Levels.WARN, Levels.ERROR),
          fc.array(
            fc.record({
              method: fc.constantFrom(
                'debug',
                'info',
                'warn',
                'error' as const
              ),
              msg: fc.string({ maxLength: 20 })
            }),
            { maxLength: 40 }
          ),
          async (level, entries) => {
            const append = jest.fn();
            const pbtLogger = createLogger(level);
            pbtLogger.setOutput({ appendLine: append } as OutputChannel);

            entries.forEach((entry) => {
              pbtLogger[entry.method](entry.msg);
            });

            const expectedCount = entries.filter((entry) => {
              if (entry.method === 'debug') {
                return level === Levels.DEBUG;
              }
              if (entry.method === 'info') {
                return level <= Levels.INFO;
              }
              if (entry.method === 'warn') {
                return level <= Levels.WARN;
              }

              return level <= Levels.ERROR;
            }).length;

            expect(append.mock.calls).toHaveLength(expectedCount);
          }
        )
      );
    });
  });
});
