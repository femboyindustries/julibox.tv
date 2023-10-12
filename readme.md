# julibox.tv

Attempt to get Jackbox client modification to be easy and accessible by hosting a proxy server. This repo also hosts individual game tools and mods.

## Setup

0. Get [Crystal](https://crystal-lang.org/) and preferably a [Linux install](https://voidlinux.org). Clone the repository with `git clone https://github.com/femboyindustries/julibox.tv`.
1. Run `shards install` and `shards build`. You should now have a binary in `bin/julibox`!

### Mocking

Mocking involves trying to mock what the Jackbox server would send the client. You can start a mock session with:

```sh
julibox mock [game]
```

where `[game]` is a game supported by the tool (currently only `nopus-opus`).

This will start a local server. Open the URL given in the logs, and connect using any 4-letter code.

### Proxying

_TODO; this does not work._

Proxying simply applies the existing mods onto the clients of everyone who uses it, otherwise proxying every request directly to Jackbox servers and back. You can start a proxy session with:

```sh
julibox proxy
```

### Config

Your config is located in:

| | |
| - | - |
| Windows | `%AppData%/julibox/`                     |
| OSX     | `~/Library/Application Support/julibox/` |
| Linux   | `~/.config/julibox/`                     |

Upon starting the tool, it will write a sample config with comments describing every config value. You'll want to look through those for things like enabling mods, configuring them, etc.

### Mods

Mods take on a simple JSON format, which you can look at a sample of [here](mods/not-dodoremi/mod.julibox.json) - you can define configuration values, variables which can read from files, and then be able to use those in rules which actually modify files served by the proxy. Documentation is yet to be properly written.

There are a few mods currently in `mods/` - if you wish to create your own, you are free to add them to the repository aswell.