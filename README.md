# Insomnia Plugin - Get Device Secret

Obtains the `device_secret` from a PKCE login which had the `device_sso` scope.

This is HEAVILY dependent on Insomnia version [2021.5.3](https://github.com/Kong/insomnia/releases/tag/core%402021.5.3)

## Installation

The Insomnia data directory can be found:

| OS | Directory |
| -- | --------- |
| Windows | %APPDATA%/Insomnia |
| OSX | ~/Library/Application Support/Insomnia |
| Linux | ~/.config/Insomnia |

```powershell
cd <dataDirectory>/plugins

git checkout https://github.com/rbedger/insomnia-plugin-get-device-secret.git
```

If you already have Insomnia open, click the Tools menu, and select Reload Plugins

## Usage

Within a request that uses PKCE auth, and requests the `device_sso` scope:

You can use intellisense by hitting `CTRL-SPACE` and typing `get`, at which point `Get Device Secret` should be listed as an option.

If you need to embed the device secret into something else, you can also use a "custom" function: `{% getdevicesecret  %}`
