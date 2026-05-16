import fc from 'fast-check';

import { gists } from '../gists-service';

describe('GistService tests', () => {
  let testGists: any;
  beforeEach(() => {
    testGists = gists;
  });
  describe('#configure', () => {
    test('accepts arbitrary valid endpoint urls (PBT)', async () => {
      await fc.assert(
        fc.asyncProperty(fc.webUrl(), async (url) => {
          testGists.configure({ url });

          const response = await testGists.list();
          expect(Array.isArray(response.data)).toBe(true);
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
