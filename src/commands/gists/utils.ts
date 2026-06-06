import {
  commands,
  Position,
  Range,
  Selection,
  // TextEdit,
  TextEditor,
  window,
  workspace,
  WorkspaceEdit
} from 'vscode';

import type { Gist } from '../../types/gist.js';
import * as utils from '../../utils/index.js';

type GistFileForOpen = { content: string; contentLoaded?: boolean };

type SelectableGistFile = {
  description: string;
  label: string;
  [filename: string]: string | GistFileForOpen;
};

const assertLoadedFile = (
  file: GistFileForOpen | undefined
): GistFileForOpen => {
  if (!file || file.contentLoaded === false) {
    throw new Error('Gist file content is not available');
  }

  return file;
};

const _openDocument = async (file: string): Promise<void> => {
  const doc = await workspace.openTextDocument(file);
  await window.showTextDocument(doc);
  commands.executeCommand('workbench.action.keepEditor');
};

const toSelectableFiles = (gist: {
  files: { [name: string]: GistFileForOpen };
}): SelectableGistFile[] =>
  Object.entries(gist.files)
    .filter((entry): entry is [string, { content: string }] =>
      Boolean(entry[1])
    )
    .map(([key, file]) => ({
      description: '',
      [key]: file,
      label: key
    }));

const resolveSelectedFile = (
  gist: { files: { [name: string]: GistFileForOpen } },
  selectedFile: SelectableGistFile | undefined
): { content: string; filename: string } | undefined => {
  if (!selectedFile) {
    return undefined;
  }

  const selected = assertLoadedFile(gist.files[selectedFile.label]);

  if (typeof selected.content !== 'string') {
    throw new Error('Invalid gist file content');
  }

  return {
    content: selected.content,
    filename: selectedFile.label
  };
};

const selectFile = async (gist: {
  files: { [name: string]: GistFileForOpen };
}): Promise<{ content: string; filename: string } | undefined> => {
  const files = toSelectableFiles(gist);
  const selectedFile =
    files.length > 1
      ? await window.showQuickPick(files)
      : await Promise.resolve(files[0]);

  return resolveSelectedFile(gist, selectedFile);
};

const openGist = async (
  gist: Gist,
  maxFiles = 10
): Promise<{
  fileCount: number;
  files: { [x: string]: { content: string } };
  id: string;
}> => {
  const { id, files, fileCount } = gist;

  if (fileCount > maxFiles) {
    const file = await selectFile(gist);
    if (!file) {
      throw new Error('File not found');
    }
    const filePath = utils.files.fileSync(id, file.filename, file.content);
    await _openDocument(filePath);
  } else {
    const loadedFiles = Object.fromEntries(
      Object.entries(files).map(([filename, file]) => [
        filename,
        assertLoadedFile(file)
      ])
    );
    const filePaths = utils.files.filesSync(id, loadedFiles);

    // await is not available not available in forEach
    for (const filePath of filePaths) {
      await _openDocument(filePath);
    }
  }

  return { id, files, fileCount };
};

const insertText = async (
  editor: TextEditor,
  text: string
): Promise<boolean> => {
  const document = editor.document;
  const workspaceEdit = new WorkspaceEdit();
  const range = new Range(editor.selection.start, editor.selection.end);
  workspaceEdit.replace(document.uri, range, text);

  return workspace.applyEdit(workspaceEdit).then((applied: boolean) => {
    if (applied) {
      const lines = text.trim().split('\n');
      const endPosition = new Position(
        lines.length + range.start.line - 1,
        (lines[lines.length - 1] || '').length
      );

      const selection = new Selection(range.start, endPosition);
      editor.selection = selection;
    }

    return applied;
  });
};

export { insertText, openGist, resolveSelectedFile, selectFile };
