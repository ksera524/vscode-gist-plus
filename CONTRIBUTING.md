# Contributing

Pull requests and contributions are warmly welcome.
Please follow existing code style and commit message conventions. Also remember to keep documentation
updated.

## Fork Scope and Attribution

This repository is an unofficial maintenance fork of `kenhowardpdx/vscode-gist`.
Contributions should preserve compatibility and improve reliability on modern environments.
Please do not present this project as the original upstream; keep attribution to the original author intact.

**Pull Requests:** You don't need to bump version numbers or modify anything related to releasing.


# Maintaining

## Release

Run the full release flow from a clean `develop` branch:

```
npm run release
```

This runs tests, bumps the version with `standard-version`, creates the VSIX, pushes the release commit and tag, creates the GitHub Release, and publishes the VSIX to the VS Code Marketplace.

Individual release steps are also available:

```
npm run release:bump
npm run package:vsix
npm run release:push
npm run release:github
npm run release:vscode
```

## Compiling

There's no need to manually compile. The launch tasks trigger the 'compile' script from the package.json file which continuously watches TypeScript files for changes.

## Test

Run the 'Launch Tests' task from the Debug pane (Ctrl+Shift+D) to execute tests.

## Debug

Run the 'Launch Extension' task from the Debug pane (Ctrl+Shift+D). You can set breakpoints inside your TypeScript files and inspect your code while the extension is running.

## Linting

It's recommended that you have tslint installed globally and have the [vscode-tslint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) extension installed.

Install tslint globally:
```
npm install -g tslint
```

This will inform you in the editor when your code does not match the project formatting rules.

Alternatively you can run the `lint` task from the command line:
```
npm run lint
```

Please be sure to lint and fix any formatting errors before submitting a pull request.

You can fix formatting errors automatically by running:
```
npm run lint -- --fix
```
