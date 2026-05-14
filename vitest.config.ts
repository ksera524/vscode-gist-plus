import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@octokit/rest': path.resolve(__dirname, '__mocks__/@octokit/rest.ts'),
      vscode: path.resolve(__dirname, '__mocks__/vscode.ts')
    }
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['**/__tests__/**/(*.)+(spec|test).ts?(x)'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      all: false,
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/migrations/**',
        'src/**/index.ts'
      ],
      thresholds: {
        branches: 75,
        functions: 90,
        lines: 90,
        statements: 90
      }
    }
  }
});
