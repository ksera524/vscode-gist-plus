const fs = require('fs');
const path = require('path');

const testEntry = path.join(process.cwd(), 'out', 'test', 'suite', 'index.js');

if (!fs.existsSync(testEntry)) {
  console.log('No VS Code integration test suite is configured yet. Skipping.');
  process.exit(0);
}

const { runTests } = require('@vscode/test-electron');

runTests({
  extensionDevelopmentPath: process.cwd(),
  extensionTestsPath: testEntry
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
