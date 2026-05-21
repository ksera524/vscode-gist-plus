import { isGist } from '../type-guards';

describe('gist type guards', () => {
  test('returns true for a valid gist shape', () => {
    expect.assertions(1);

    expect(
      isGist({
        createdAt: '2026-01-01',
        description: 'demo gist',
        fileCount: 1,
        files: {
          'demo.md': {
            content: '# demo'
          }
        },
        id: 'abc123',
        name: 'demo gist',
        public: true,
        updatedAt: '2026-01-02',
        url: 'https://gist.github.com/abc123'
      })
    ).toBe(true);
  });

  test('returns false for url-only object', () => {
    expect.assertions(1);

    expect(isGist({ url: 'https://gist.github.com/fake' })).toBe(false);
  });

  test('returns false when gist file content is missing', () => {
    expect.assertions(1);

    expect(
      isGist({
        createdAt: '2026-01-01',
        description: 'demo gist',
        fileCount: 1,
        files: {
          'demo.md': {
            filename: 'demo.md'
          }
        },
        id: 'abc123',
        name: 'demo gist',
        public: true,
        updatedAt: '2026-01-02',
        url: 'https://gist.github.com/abc123'
      })
    ).toBe(false);
  });
});
