// tslint:disable:no-any
export const Position = jest.fn(function Position(
  this: any,
  line: number,
  character: number
) {
  this.line = line;
  this.character = character;
});

export const Range = jest.fn(function Range(this: any, start: any, end: any) {
  this.start = start;
  this.end = end;
});

export const StatusBarAlignment = {
  Left: true
};

export const Uri = { parse: jest.fn((url: string) => url) };

export const WorkspaceEdit = jest.fn(function WorkspaceEdit(this: any) {
  this.replace = jest.fn();
});

export const commands = {
  executeCommand: jest.fn()
};

export const env = {
  language: 'en-US'
};

export const extensions = {
  getExtension: jest.fn(() => '1.0.0')
};

export const window = {
  createStatusBarItem: jest.fn(),
  showErrorMessage: jest.fn(),
  showInformationMessage: jest.fn(),
  showInputBox: jest.fn(),
  showQuickPick: jest.fn(),
  showTextDocument: jest.fn()
};

export const workspace = {
  applyEdit: jest.fn().mockResolvedValue(true),
  getConfiguration: jest.fn(() => ({ get: jest.fn(), update: jest.fn() })),
  openTextDocument: jest.fn()
};
