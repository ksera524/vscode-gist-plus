import { window } from 'vscode';

import type { Gist } from '../../types/gist.js';
import { prompt, quickPick } from '../input.js';

const showInputBoxSpy = jest.spyOn(window, 'showInputBox');
const showQuickPickSpy = jest.spyOn(window, 'showQuickPick');

describe('Input Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('#prompt', () => {
    test('a prompt is made', async () => {
      expect.assertions(2);

      await prompt('foo', 'bar');

      expect(showInputBoxSpy.mock.calls).toHaveLength(1);
      expect(showInputBoxSpy).toHaveBeenCalledWith({
        prompt: 'foo',
        value: 'bar'
      });
    });
  });
  describe('#quickPick', () => {
    test('should show quickpick pane', async () => {
      expect.assertions(2);

      const mockGist: Gist = {
        createdAt: '2024-01-01T00:00:00Z',
        description: 'test gist',
        fileCount: 1,
        files: {
          'file-one.txt': {
            content: '',
            filename: 'file-one.txt',
            language: 'text',
            raw_url: '',
            size: 0,
            type: 'text/plain'
          }
        },
        id: '123',
        name: 'test gist',
        public: true,
        updatedAt: '2024-01-01T00:00:00Z',
        url: 'https://example.com/gist/123'
      };

      await quickPick([mockGist]);

      expect(showQuickPickSpy).toHaveBeenCalledTimes(1);
      expect(showQuickPickSpy).toHaveBeenCalledWith([
        {
          block: mockGist,
          description: expect.any(String),
          label: '1. test gist'
        }
      ]);
    });
  });
});
