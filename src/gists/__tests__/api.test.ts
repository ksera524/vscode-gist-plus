import {
  configure,
  createGist,
  deleteFile,
  deleteGist,
  getGist,
  getGists,
  updateGist
} from '../api';
import { gists } from '../gists-service';

describe('Gists API Tests', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('#configure', () => {
    test('should not throw an error', () => {
      expect(() => configure({ key: 'foo', url: 'bar' })).not.toThrowError();
    });
  });
  describe('#getGists', () => {
    test('list without params should return one block', async () => {
      expect.assertions(2);

      const gists: any = await getGists();

      expect(gists.length).toBe(2);

      expect(gists[0].description).toBe('gist one');
    });
    test('list with starred params should return one block', async () => {
      expect.assertions(2);

      const gists: any = await getGists(true);

      expect(gists.length).toBe(2);

      expect(gists[0].description).toBe('gist one');
    });
    test('public gists should remain public', async () => {
      expect.assertions(2);

      const gists: any = await getGists();

      expect(gists[1].public).toBe(false);
      expect(gists[0]).toStrictEqual({
        createdAt: expect.any(String),
        description: 'gist one',
        fileCount: expect.any(Number),
        files: expect.any(Object),
        id: expect.any(String),
        name: 'gist one',
        public: true,
        updatedAt: expect.any(String),
        url: expect.any(String)
      });
    });

    test('throws formatted error when list fails', async () => {
      expect.assertions(1);
      const listSpy = jest
        .spyOn(gists, 'list')
        .mockRejectedValueOnce(new Error('{"message":"list failed"}'));

      await expect(getGists()).rejects.toThrow('list failed');
      listSpy.mockRestore();
    });

    test('throws formatted error when listStarred fails', async () => {
      expect.assertions(1);
      const listStarredSpy = jest
        .spyOn(gists, 'listStarred')
        .mockRejectedValueOnce(new Error('{"message":"starred failed"}'));

      await expect(getGists(true)).rejects.toThrow('starred failed');
      listStarredSpy.mockRestore();
    });
  });
  describe('#getGist', () => {
    test('retrieves a gist by id', async () => {
      expect.assertions(2);

      const gist: any = await getGist('123abc');

      expect(gist.description).toBe('gist one');
      expect(gist.id).toBe('123abc');
    });

    test('returns empty gist object for invalid gist payload', async () => {
      expect.assertions(1);
      const getSpy = jest
        .spyOn(gists, 'get')
        .mockResolvedValueOnce({ data: 'not-an-object' } as unknown);

      const gist: any = await getGist('bad-id');

      expect(gist).toStrictEqual({});
      getSpy.mockRestore();
    });

    test('formats json error messages', async () => {
      expect.assertions(1);
      const getSpy = jest
        .spyOn(gists, 'get')
        .mockRejectedValueOnce(new Error('{"message":"forced get failure"}'));

      await expect(getGist('bad-id')).rejects.toThrow('forced get failure');
      getSpy.mockRestore();
    });

    test('passes non-json errors through unchanged', async () => {
      expect.assertions(1);
      const getSpy = jest
        .spyOn(gists, 'get')
        .mockRejectedValueOnce(new Error('plain text failure'));

      await expect(getGist('bad-id')).rejects.toThrow('plain text failure');
      getSpy.mockRestore();
    });
  });
  describe('#updateGist', () => {
    test('updates a gist', async () => {
      expect.assertions(2);

      const gist = await updateGist(
        'abc123',
        'foo-bar.md',
        'test-content-foo-bar.md'
      );

      const response: any = gist ? gist : {};

      expect(response.id).toBe('abc123');
      expect(response.files['foo-bar.md']).toStrictEqual({
        content: 'test-content-foo-bar.md'
      });
    });

    test('replaces null content with a single space', async () => {
      expect.assertions(1);

      const gist = await updateGist('abc123', 'empty.md', null);
      const response: any = gist ? gist : {};

      expect(response.files['empty.md']).toStrictEqual({ content: ' ' });
    });

    test('throws formatted error when update fails', async () => {
      expect.assertions(1);
      const updateSpy = jest
        .spyOn(gists, 'update')
        .mockRejectedValueOnce(new Error('{"message":"update failed"}'));

      await expect(updateGist('abc123', 'empty.md', 'x')).rejects.toThrow(
        'update failed'
      );
      updateSpy.mockRestore();
    });
  });
  describe('#createGist', () => {
    test('creates a gist', async () => {
      expect.assertions(2);

      const gist = await createGist(
        { 'file-one.txt': { content: 'test-content' } },
        'test-description',
        true
      );

      expect(typeof gist.id).toStrictEqual('string');
      expect(gist.files).toStrictEqual({
        'file-one.txt': { content: 'test-content' }
      });
    });

    test('throws formatted error when create fails', async () => {
      expect.assertions(1);
      const createSpy = jest
        .spyOn(gists, 'create')
        .mockRejectedValueOnce(new Error('{"message":"create failed"}'));

      await expect(
        createGist({ 'file-one.txt': { content: 'test-content' } })
      ).rejects.toThrow('create failed');
      createSpy.mockRestore();
    });
  });
  describe('#deleteGist', () => {
    test('deletes a gist', async () => {
      expect.assertions(1);

      let error: string | undefined;
      try {
        await deleteGist('1234');
      } catch (err) {
        error = err;
      }

      expect(error).toBeUndefined();
    });

    test('throws formatted error when delete fails', async () => {
      expect.assertions(1);
      const deleteSpy = jest
        .spyOn(gists, 'delete')
        .mockRejectedValueOnce(new Error('{"message":"delete failed"}'));

      await expect(deleteGist('1234')).rejects.toThrow('delete failed');
      deleteSpy.mockRestore();
    });
  });
  describe('#deleteFile', () => {
    test('deletes a file', async () => {
      expect.assertions(1);

      let error: string | undefined;
      try {
        await deleteFile('1234', 'foo.txt');
      } catch (err) {
        error = err;
      }

      expect(error).toBeUndefined();
    });

    test('throws formatted error when file delete fails', async () => {
      expect.assertions(1);
      const updateSpy = jest
        .spyOn(gists, 'update')
        .mockRejectedValueOnce(new Error('{"message":"delete file failed"}'));

      await expect(deleteFile('1234', 'foo.txt')).rejects.toThrow(
        'delete file failed'
      );
      updateSpy.mockRestore();
    });
  });
});
