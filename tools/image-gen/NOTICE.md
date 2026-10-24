# Vendored: media-pipeline (claude-image-gen)

`cli.bundle.js` and `bundle.js` are the standalone CLI and the MCP server from
https://github.com/guinacio/claude-image-gen (plugin name `media-pipeline`,
version 1.2.3, commit 9ae689d2f1163ccba1900fa58a75436ef4d8d75b, MIT licence, see `LICENSE`).

They were rebuilt from that commit's TypeScript source with `npm ci && npm run bundle`
and are byte-identical to the bundles committed upstream; the upstream test suite
(75 tests) passed on the rebuilt output.

The CLI generates images with Google Gemini (default) or OpenAI image models using
an API key from the environment (`GEMINI_API_KEY` / `OPENAI_API_KEY`) and writes the
result to disk. It contacts only the chosen provider's API.

To update: clone the upstream repository, run `cd mcp-server && npm ci && npm run bundle`,
copy `build/cli.bundle.js` and `build/bundle.js` here, and record the new commit above.
