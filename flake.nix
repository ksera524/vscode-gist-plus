{
  description = "vscode-gist-plus dev shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAllSystems = f:
        nixpkgs.lib.genAttrs systems (system:
          f {
            pkgs = import nixpkgs { inherit system; };
          });
    in
    {
      devShells = forAllSystems ({ pkgs }: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nspr
            nss
            alsa-lib
            glib
            dbus
            atk
            at-spi2-atk
            at-spi2-core
            cairo
            pango
            gtk3
            libx11
            libxcomposite
            libxdamage
            libxext
            libxfixes
            libxrandr
            libxcb
            libgbm
            mesa
            expat
            libxkbcommon
            udev
          ];

          LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.nspr
            pkgs.nss
            pkgs.alsa-lib
            pkgs.glib
            pkgs.dbus
            pkgs.atk
            pkgs.at-spi2-atk
            pkgs.at-spi2-core
            pkgs.cairo
            pkgs.pango
            pkgs.gtk3
            pkgs.libx11
            pkgs.libxcomposite
            pkgs.libxdamage
            pkgs.libxext
            pkgs.libxfixes
            pkgs.libxrandr
            pkgs.libxcb
            pkgs.libgbm
            pkgs.mesa
            pkgs.expat
            pkgs.libxkbcommon
            pkgs.udev
          ];

        };
      });
    };
}
