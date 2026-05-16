# Gist Extension

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version-short/ksera524.vscode-gist-plus.png)](https://marketplace.visualstudio.com/items?itemName=ksera524.vscode-gist-plus)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/ksera524.vscode-gist-plus.png)](https://marketplace.visualstudio.com/items?itemName=ksera524.vscode-gist-plus)

Visual Studio Code 上で GitHub Gist を扱える拡張機能です。公開・非公開 Gist の追加、編集、削除ができます。

## Fork Notice

このプロジェクトは [kenhowardpdx/vscode-gist](https://github.com/kenhowardpdx/vscode-gist) の非公式メンテナンスフォークです。
オリジナルの著作権と功績は [Ken Howard](https://github.com/kenhowardpdx) に帰属します。
このフォークは、Windows 11 や最近の VS Code リリースを含むモダンな環境で拡張機能を継続利用できるようにするために存在します。

## Installation

<kbd>F1</kbd> を押して `extension` と入力し、コマンド一覧を絞り込みます。`Extensions: Install Extensions` を選択してください。
一覧から `Gist Extension` 拡張機能を選択します。

## Development Environment (Nix)

このリポジトリには、Linux 上で再現可能な開発環境を構築するための Nix flake ベース開発シェルが含まれています。

### File Placement

- `flake.nix`: リポジトリルート
- `.envrc`: リポジトリルート（`direnv` 利用者向けに `use flake` を記載）

### Prerequisites

1. [Nix](https://nixos.org/download/) をインストールします。
2. `nix-command` と `flakes` 機能を有効化します。

Nix の設定で experimental features をグローバルに有効化できます:

```ini
experimental-features = nix-command flakes
```

### Enter the Development Shell

Option A (manual):

```bash
nix develop
```

Option B (automatic with direnv):

```bash
# one-time setup
nix profile install nixpkgs#direnv nixpkgs#nix-direnv

# in this repository
direnv allow
```

### Bootstrap and Verify

シェルに入ったあと、次を実行します:

```bash
npm install
npm run compile
npm test
```

### Notes

- 現在の flake 出力は Linux の `x86_64-linux` と `aarch64-linux` を対象としています。
- 開発シェルには Electron/VS Code のテストツールが利用するシステムライブラリが含まれています。

## GitHub Profiles

_**NOTE:** GitHub または GitHub Enterprise に認証するには personal access token の設定が必須です。_

<kbd>F1</kbd> を押して `select profile` と入力すると、プロファイルセレクタを初期化できます。必要な数だけプロファイルを追加できます。

![vscode-gist-profiles](./images/vscode-gist-profiles.gif)

GitHub Enterprise アカウントを使う場合は、適切な API URL を必ず設定してください。この拡張機能は GitHub REST v3 API を使用します。GHE API URL は次の形式になります: `http(s)://[hostname]/api/v3` [(documentation)](https://developer.github.com/enterprise/2.13/v3/#schema)

## Usage

### Create Gists

Gist を作成するには、ファイルを開いてアクティブな状態にしておく必要があります。

<kbd>F1</kbd> を押し、次を入力します:

~~~
GIST: Create New Gist
~~~

Gist の説明文入力を求められます。

### Open/Edit Gists

<kbd>F1</kbd> を押し、次のいずれかを入力します:

~~~
GIST: Open Gist
GIST: Open Favorite Gist
~~~

その Gist に含まれるすべてのファイルがグループレイアウトで開かれます。

**owned*** Gist を開いた場合、保存時に新しいリビジョンがコミットされます。

\* owned gist は、あなた自身が作成した Gist を指し、favorite（star）した Gist は含みません。

次のコマンドも利用できます:

~~~
GIST: Delete Gist
GIST: Delete File
GIST: Add File
GIST: Open Gist In Browser
GIST: Insert Text From Gist File
GIST: Insert Text From Favorite Gist File
~~~

## Extension Settings

ほとんどの場合、これらの設定を変更する必要はありません。

| Setting | Type | Default Value | Purpose |
|:--------|:-----|:--------------|:--------|
| maxFiles | Number | 10 | 確認なしで開くファイル数の上限。 |
| defaultPrivate | Boolean | false | 新規作成する Gist を既定で PRIVATE にする。 |
| profileOptions | Object | {} | プロファイル設定オプションを上書きする。 |

`profileOptions` はデバッグ向けの設定を提供します。`key`、`url`、`rejectUnauthorized` をプロファイル名とともに指定できます。`profileOptions` を利用する前に、対象プロファイルを *必ず* 作成しておく必要があります。

```js
interface ProfileOptions {
    key?: string; // the personal access token to use
    url?: string; // the REST endpoint to use
    rejectUnauthorized?: boolean; // set this to false if you are having ssl issues with your enterprise REST endpoint
}
```

`profileOptions` の値の例:

```js
{
    "GHE": { // "GHE" MUST correspond with the name used when originally configuring the profile
        "rejectUnauthorized": false
    }
}
```

## All Commands & Keyboard Mappings

コマンドと対応するキーボードショートカットの一覧です。

| Command | Command Pallet Label | Keyboard Mapping | Notes |
|:--------|:---------------------|:-----------------|:------|
|extension.gist.open|Open Gist|ctrl+alt+o|
|extension.gist.openFavorite|Open Favorite Gist|not mapped|
|extension.gist.create|Create New Gist|not mapped|
|extension.gist.openInBrowser|Open Gist In Browser|ctrl+alt+b|
|extension.gist.delete|Delete Gist|not mapped|
|extension.gist.deleteFile|Delete File|not mapped|
|extension.gist.add|Add File|ctrl+alt+a ctrl+alt+a|
|extension.gist.insert|Insert Text From Gist File|not mapped|
|extension.gist.insertFavorite|Insert Text From Favorite Gist File|not mapped|
|extension.profile.select|Select Profile|ctrl+alt+=|
|extension.resetState|n/a|ctrl+shift+0|Delete All Extension Memory (removes auth tokens)|

## Show Your Support

このメンテナンスフォークを応援いただける場合は、次をご検討ください:
- [Write a Review](https://marketplace.visualstudio.com/items?itemName=ksera524.vscode-gist-plus#review-details "Write a review")
- [Star or Fork this repository](https://github.com/ksera524/vscode-gist-plus "Star or fork this repository")

オリジナルプロジェクトおよび作者を応援いただける場合は、次をご検討ください:
- [Become a Sponsor](https://www.patreon.com/kenhowardpdx "Become a sponsor on Patreon")
- [Donations via PayPal](https://www.paypal.me/kenhowardpdx "One-time donations via PayPal")
- [Donations via Cash App](https://cash.me/$kenhowardpdx "One-time donations via Cash App")
- [Star the original repository](https://github.com/kenhowardpdx/vscode-gist "Star the original repository")

## Maintainer

Original author: [Ken Howard](https://github.com/kenhowardpdx)

Current maintainer of this fork: [ksera524](https://github.com/ksera524)
