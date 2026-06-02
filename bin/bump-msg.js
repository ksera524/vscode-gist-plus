import pkg from '../package.json' with { type: 'json' };

const bumpMessage = `chore(release): bump to v${pkg.version}`;

export { bumpMessage };
