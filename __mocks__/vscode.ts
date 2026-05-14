// tslint:disable:no-any
module.exports = {
  Position: jest.fn(function Position(
    this: any,
    line: number,
    character: number
  ) {
    this.line = line;
    this.character = character;
  }),
  Range: jest.fn(function Range(this: any, start: any, end: any) {
    this.start = start;
    this.end = end;
  }),
  StatusBarAlignment: {
    Left: true
  },
  Uri: { parse: jest.fn((url: string) => url) },
  WorkspaceEdit: jest.fn(function WorkspaceEdit(this: any) {
    this.replace = jest.fn();
  }),
  commands: {
    executeCommand: jest.fn()
  },
  env: {
    language: 'en-US'
  },
  extensions: {
    getExtension: jest.fn(() => '1.0.0')
  },
  window: {
    createStatusBarItem: jest.fn(),
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    showInputBox: jest.fn(),
    showQuickPick: jest.fn(),
    showTextDocument: jest.fn()
  },
  workspace: {
    applyEdit: jest.fn().mockResolvedValue(true),
    getConfiguration: jest.fn(() => ({ get: jest.fn(), update: jest.fn() })),
    openTextDocument: jest.fn()
  }
};
