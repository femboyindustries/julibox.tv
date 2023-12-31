# julibox.tv

Attempt to get Jackbox client modification to be easy and accessible by hosting a proxy server. This repo also hosts individual game tools and mods.

## Build

0. Get [Crystal](https://crystal-lang.org/) and preferably a [Linux install](https://voidlinux.org). Clone the repository with `git clone https://github.com/femboyindustries/julibox.tv`.
1. Run `shards install` and `shards build`.
  - Running `shards build --production -p --release` will take slower, but produce a more optimized binary

You should now have a binary in `bin/julibox`!

## Config

Your config should be in this location:

| | |
| - | - |
| Windows | `%AppData%/julibox/`                     |
| OSX     | `~/Library/Application Support/julibox/` |
| Linux   | `~/.config/julibox/`                     |

Run the binary once to generate a config, then edit as needed. This will control which mods are enabled, their preferences, etc.

### Mocking

Mocking involves trying to mock what the Jackbox server would send the client. You can start a mock session with:

```sh
julibox mock [game]
```

where `[game]` is a game supported by the tool (currently only `nopus-opus`).

This will start a local server. Open the URL given in the logs, and connect using any 4-letter code.

**(This does NOT currently work locally in Chromium-based browsers, for unknown reasons!!!)**

### Proxying

_TODO; this does not work._

Proxying simply applies the existing mods onto the clients of everyone who uses it, otherwise proxying every request directly to Jackbox servers and back. You can start a proxy session with:

```sh
julibox proxy
```

### Mods

Mods take on a simple JSON format, which you can look at a sample of [here](mods/not-dodoremi/mod.julibox.json) - you can define configuration values, variables which can read from files, and then be able to use those in rules which actually modify files served by the proxy. Documentation is yet to be properly written.

There are a few mods currently in `mods/` - if you wish to create your own, you are free to add them to the repository aswell.

#### `not-dodoremi`

You'll want to configure `modfile` to point at a JS file (use [`misc/modfiles/test.js`](misc/modfiles/test.js) as an example), and optionally `song` to point at an OGG file.

You'll be given a [Mirin](https://github.com/XeroOl/notitg-mirin/)-like template to work with; you can read the code for it in [`twink-template.js`](mods/not-dodoremi/src/twink-template.js). The list of mods is available [here](mods/not-dodoremi/src/mods.txt). Have fun!

##### Dev keybinds


| Key     | Action                  |
| -       | -                       |
| `       | Hide/show debug overlay |
| ,       | Seek back 1 second      |
| .       | Seek forward 1 second   |
| r       | Reload modfile          |
| p       | Pause/play from point   |
| ;       | Set play point          |