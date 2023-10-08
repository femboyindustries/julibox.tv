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

### Mods

_TODO; for now every mod available is enabled by default._

When using the tool, you are able to pass in a comma-seperated list of mods:

```sh
julibox proxy --mods 'proxy,branding,http,nopus-opus-modfile'
```

These read from folders in `mods/`. The format is yet to be documented.