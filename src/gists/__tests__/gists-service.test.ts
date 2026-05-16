import fc from 'fast-check';
import { Octokit } from '@octokit/rest';

import { gists } from '../gists-service';

describe('GistService tests', () => {
  let testGists: any;
  beforeEach(() => {
    testGists = gists;
  });
  describe('#configure', () => {
    test('applies configure options to Octokit construction (PBT)', async () => {
      const octokitConstructor = Octokit as unknown as {
        mock: { calls: unknown[][] };
      };

      await fc.assert(
        fc.asyncProperty(fc.webUrl(), async (url) => {
          const key = `key-${Math.random().toString(36).slice(2, 8)}`;
          const rejectUnauthorized = false;

          testGists.configure({ key, rejectUnauthorized, url });

          const configCall =
            octokitConstructor.mock.calls[
              octokitConstructor.mock.calls.length - 1
            ];

          expect(configCall).toBeDefined();
          const options = configCall?.[0] as {
            agent?: { options?: { rejectUnauthorized?: boolean } };
            auth?: string;
            baseUrl?: string;
          };

          expect(options.baseUrl).toBe(url);
          expect(options.auth).toBe(key);
          expect(options.agent).toBeDefined();
          expect(options.agent?.options?.rejectUnauthorized).toBe(
            rejectUnauthorized
          );
        })
      );
    });
  });
  describe('#create', () => {
    test('create a gist', async () => {
      expect.assertions(1);

      const response = await testGists.create({
        description: 'test',
        files: { 'fileone.txt': { content: 'test content' } },
        public: true
      });

      expect(response.data.description).toStrictEqual('test');
    });
  });
  describe('#list', () => {
    test('list gists', async () => {
      expect.assertions(1);

      const response = await testGists.list();

      expect(response.data[0].description).toBe('gist one');
    });
  });
  describe('#listStarred', () => {
    test('list starred gists', async () => {
      expect.assertions(1);

      const response = await testGists.listStarred();

      expect(response.data[0].description).toBe('gist one');
    });
  });
  describe('#get', () => {
    test('get a gist', async () => {
      const results = await testGists.get({ gist_id: 'one-really-cool-id' });
      expect(results.data.id).toBe('one-really-cool-id');
    });
  });
});
