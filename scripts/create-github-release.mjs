import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');

const version = packageJson.version;
const tag = `v${version}`;
const vsixPath = `vscode-gist-plus-${version}.vsix`;

const headingPattern = new RegExp(`^#{1,6} \\[?${version.replaceAll('.', '\\.')}\\]?[^\\n]*$`, 'm');
const headingMatch = changelog.match(headingPattern);
const notes = headingMatch
  ? changelog
      .slice(headingMatch.index + headingMatch[0].length)
      .split(/\n(?=#{1,6} (?:\[?\d+\.\d+\.\d+\]?|<a name=))/)[0]
      .trim()
  : '';

const releaseNotes = notes || `Release ${tag}`;
const result = spawnSync(
  'gh',
  ['release', 'create', tag, vsixPath, '--repo', 'ksera524/vscode-gist-plus', '--title', tag, '--notes', releaseNotes],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
