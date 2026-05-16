import { gists } from '../gists-service';

describe('GistService tests', () => {
  let testGists: any;
  beforeEach(() => {
    testGists = gists;
  });
  test('has default baseUrl', () => {
    expect.assertions(1);

    expect(testGists.options).toStrictEqual({
      baseUrl: 'https://api.github.com'
    });
  });
  describe('#configure', () => {
    test('configure api', () => {
      expect.assertions(1);

      testGists.configure({ url: 'https://foo.bar/api' });
      expect(testGists.options).toStrictEqual({
        agent: expect.anything(),
        baseUrl: 'https://foo.bar/api'
      });
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
