import { createRequire } from 'module';
import { vi } from 'vitest';

const deepMock = (value: unknown, seen = new WeakMap()): unknown => {
  if (typeof value === 'function') {
    return vi.fn();
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value as object)) {
    return seen.get(value as object);
  }

  const output: any = Array.isArray(value) ? [] : {};
  seen.set(value as object, output);

  Object.keys(value as Record<string, unknown>).forEach((key) => {
    output[key] = deepMock((value as Record<string, unknown>)[key], seen);
  });

  return output;
};

const getCallerFile = (): string | undefined => {
  const stack = new Error().stack;

  if (!stack) {
    return undefined;
  }

  const lines = stack.split('\n').slice(2);
  for (const line of lines) {
    const match =
      line.match(/\((.*):(\d+):(\d+)\)$/) || line.match(/at (.*):(\d+):(\d+)$/);
    if (match && !match[1].includes('vitest.setup')) {
      return match[1];
    }
  }

  return undefined;
};

const mockFromModule = <T>(modulePath: string): T => {
  if (modulePath.includes('utils')) {
    return {
      files: {
        extractTextDocumentDetails: vi.fn(),
        fileSync: vi.fn(),
        filesSync: vi.fn(),
        getFileName: vi.fn()
      },
      input: {
        prompt: vi.fn(),
        quickPick: vi.fn()
      },
      notify: {
        error: vi.fn(),
        info: vi.fn()
      }
    } as unknown as T;
  }

  const caller = getCallerFile();
  const req = createRequire(caller || `${process.cwd()}/vitest.setup.ts`);

  return deepMock(req(modulePath)) as T;
};

Object.assign(globalThis, {
  jest: {
    ...vi,
    createMockFromModule: mockFromModule,
    genMockFromModule: mockFromModule
  }
});
