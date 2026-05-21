import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { TextDocument, TextEditor } from 'vscode';

import { TMP_DIRECTORY_PREFIX } from '../constants';

const dirSync = (token: string): string => {
  const prefix = `${[TMP_DIRECTORY_PREFIX, token].join('_')}_`;

  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
};

const fileSync = (token: string, filename: string, content: string): string => {
  const directory = dirSync(token);
  const filePath = path.join(directory, filename);
  fs.writeFileSync(filePath, content);

  return filePath;
};

const filesSync = (
  token: string,
  files: { [x: string]: { content: string } }
): string[] => {
  const directory = dirSync(token);
  const filePaths: string[] = [];
  for (const filename in files) {
    if (Object.prototype.hasOwnProperty.call(files, filename)) {
      const file = files[filename];
      if (!file) {
        continue;
      }

      const { content } = file;
      const filePath = path.join(directory, filename);
      fs.writeFileSync(filePath, content);
      filePaths.push(filePath);
    }
  }

  return filePaths;
};

const extractTextDocumentDetails = (
  doc: GistTextDocument,
  editor?: TextEditor
): {
  content: string;
  filename: string;
  id: string;
  language: string;
  path: string;
} => {
  const sep = path.sep === '\\' ? '\\\\' : path.sep;
  const regexp = new RegExp(
    `.*${TMP_DIRECTORY_PREFIX}_([^_]*)_[^${sep}]*${sep}(.*)`
  );
  const match = doc.fileName.match(regexp);
  const fullPath = match?.[0] || '';
  const id = match?.[1] || '';
  const filename = match?.[2] || '';
  const content = doc.getText();

  const { languageId } = editor ? editor.document : { languageId: 'unknown' };

  return {
    content,
    filename,
    id,
    language: languageId,
    path: path.dirname(fullPath)
  };
};

const getFileName = (doc: TextDocument, fallback?: string): string => {
  const filepath = doc.fileName;

  return path.basename(filepath) || fallback || 'unknown.txt';
};

export { fileSync, filesSync, extractTextDocumentDetails, getFileName };
