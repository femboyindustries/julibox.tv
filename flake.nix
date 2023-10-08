
{
  description = "Attempt to get Jackbox client modification to be easy and accessible, aswell as individual game tools and mods";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.05";
    crystal-flake.url = "github:manveru/crystal-flake";
  };

  outputs = { self, nixpkgs, flake-utils, crystal-flake }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        inherit (crystal-flake.packages.${system}) crystal shards;
      in
      rec {
        packages = flake-utils.lib.flattenTree rec {
          julibox = pkgs.crystal.buildCrystalPackage {
            pname = "julibox";
            version = "0.1.0";

            src = ./.;

            format = "shards";
            lockFile = ./shard.lock;
            shardsFile = ./shards.nix;

            buildInputs = with pkgs; [ openssl pkg-config ] ++ [ crystal ];

            nativeBuildInputs = with pkgs; [ openssl pkg-config ] ++ [ crystal ];

            crystal = crystal;
          };
        };

        defaultPackage = packages.julibox;

        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            openssl
          ];

          nativeBuildInputs = with pkgs; [
            pkgconfig
            crystal
            shards
          ];
        };
      });
}