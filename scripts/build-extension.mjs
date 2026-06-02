import { build, context } from 'esbuild';
import { mkdirSync, rmSync } from 'fs';

const commonOptions = {
  bundle: true,
  entryPoints: ['src/extension.ts'],
  external: ['vscode'],
  format: 'esm',
  outfile: 'out/extension.js',
  platform: 'node',
  sourcemap: true,
  target: 'node20'
};

const run = async () => {
  rmSync('out', { force: true, recursive: true });
  mkdirSync('out', { recursive: true });

  if (process.argv.includes('--watch')) {
    const ctx = await context(commonOptions);
    await ctx.watch();
    return;
  }

  await build(commonOptions);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
