# Tokens Studio Server

One of the things I noticed when building [my site](https://blairwilcox.com/) was that shifting between [Tokens Studio](https://tokens.studio/) and local development wasn't easy. A single file export didn't work with Style Dictionary out-the-box and it wasn't easy to incorporate a development change back into Tokens Studio in Figma. The goal of this project is to make that a little easier!

## How does it work?

_This is still a work in progress!_

```bash
tokens-studio-server ./tokensDir
```

| Option                | Flag                 | Description                                                                                                                               | Default Value |
| --------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| tokenDir              | N/A                  | The directory containing the token information. If the directory doesn't exist, Tokens Studio Server will create it and format it correct | N/A           |
| port                  | `-p`, `--port`       | the port the server can be accessed on                                                                                                    | `8000`        |
| figmaRoute            | `--figmaRoute`, `-r` | The route that Tokens Studio will access the server at                                                                                    | `/`           |
| styleDictionaryConfig | `--sdConfig`         | Tokens Studio Server provides an initial Style Dictionary config, but you can further customize it by pointing to another config file     | N/A           |

## TODO

- [ ] Support nested folders in the tokens directory
- [ ] Preview Tokens in generated page
  - [ ] Make this configurable
  - [ ] document this seetting/flag
- [ ] Make token directory configurable
- [ ] Separate out server definition and executable so it can be run programatically
  - [ ] Document this
