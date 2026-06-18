import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const vsixPath = `vscode-gist-plus-${packageJson.version}.vsix`;
const args = process.argv.slice(2);

if (args.includes('--dry-run')) {
  if (!existsSync(new URL(`../${vsixPath}`, import.meta.url))) {
    console.error(`Missing VSIX package: ${vsixPath}`);
    process.exit(1);
  }

  console.log(`Dry run: would publish ${vsixPath}`);
  process.exit(0);
}

const result = spawnSync('vsce', ['publish', '--packagePath', vsixPath, ...args], { stdio: 'inherit' });

process.exit(result.status ?? 1);
