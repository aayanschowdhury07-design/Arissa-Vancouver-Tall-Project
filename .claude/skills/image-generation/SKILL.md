---
name: image-generation
description: Generates AI images (photorealistic renders, concept views, atmospheric visualisations, textures, diagrams) with Google Gemini or OpenAI image models through the vendored media-pipeline CLI. Use when the user asks for an AI render, a photoreal view, a concept image, a mood image, or any picture that the procedural Three.js renderer in render/ cannot produce. Supports reference images, so pass the design boards in reference/design-boards/ when the image must match the Hollow Tree Hotel design.
---

# Image Generation Skill (project install of guinacio/claude-image-gen)

Generate AI images with Google Gemini (default) or OpenAI via the bundled CLI at
`tools/image-gen/cli.bundle.js`. This is the upstream `media-pipeline` plugin's skill,
adapted to live inside this repository instead of a plugin root.

## Project setup

- **API key** — the CLI needs `GEMINI_API_KEY` and/or `OPENAI_API_KEY` in the environment.
  If neither is set it exits with `{"success":false,"errorCode":"CONFIG_ERROR",...}`; stop and
  tell the user to add the key in the environment settings (never ask them to paste it in chat).
- **Cloud environment: network secret + proxy.** This repo's cloud environment stores the Gemini
  key as a Network secret for `generativelanguage.googleapis.com`; the agent proxy adds the
  `x-goog-api-key` header outside the VM, so the key is never visible here. Two things follow:
  run the CLI with `NODE_USE_ENV_PROXY=1` (Node's fetch ignores `HTTPS_PROXY` otherwise and the
  request leaves without the key, failing with `API_KEY_INVALID`), and export the placeholder
  `GEMINI_API_KEY=managed-by-network-secret` so the CLI's presence check passes. The helper script
  below does both automatically; for direct CLI calls prefix the command with
  `NODE_USE_ENV_PROXY=1 GEMINI_API_KEY=${GEMINI_API_KEY:-managed-by-network-secret}`.
- **Provider** — in the cloud environment used for this repo the Gemini API host is reachable
  and `api.openai.com` is blocked by the network policy, so leave `--model` unset (Gemini) unless
  the user has allowed the OpenAI host. The default Gemini model is `gemini-3-pro-image`.
- **Output** — save generated images under `renders/ai/` (`--output-dir renders/ai`), with a
  descriptive file name. Rendered images from the Three.js scene live in `renders/`.
- **Reference images** — the design boards are in `reference/design-boards/` (WebP). Pass up to
  5 with `--reference-images` when the output must follow the Hollow Tree Hotel design. The board
  `05-elevations-and-section.webp` is the exact elevation reference; `04-tower-concept-renders.webp`
  shows the intended materiality and street-level feel.
- **Quick start for the tower** — `tools/image-gen/render-tower.sh [output-name] [aspect]` runs
  the CLI with the agreed street-level brief and all five reference boards.

## Using the CLI

```bash
NODE_USE_ENV_PROXY=1 GEMINI_API_KEY="${GEMINI_API_KEY:-managed-by-network-secret}" \
node tools/image-gen/cli.bundle.js \
  --prompt "Your detailed image description" \
  --output-dir renders/ai \
  --output renders/ai/your-image.png \
  --aspect-ratio "3:4" \
  --reference-images reference/design-boards/05-elevations-and-section.webp
```

Run from the repository root (paths above are relative to it). Any `--output` path must be
inside `--output-dir`.

### Parameters

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| --prompt, -p | Yes | - | Detailed image description |
| --output, -o | No | auto-generated | Output file path (inside the output directory) |
| --aspect-ratio, -a | No | 1:1 | 1:1, 16:9, 9:16, 4:3, 3:4, 2:3, 3:2 |
| --model, -m | No | provider default | Model to use; routes the provider (gpt-image*/dall-e* → OpenAI, others → Gemini) |
| --reference-images, -r | No | - | Reference image paths (PNG/JPEG/WebP, repeatable or comma-separated, max 5) |
| --mask | No | - | PNG mask marking the region to repaint; OpenAI only, requires --reference-images |
| --background, -b | No | provider default | auto, transparent or opaque; OpenAI only |
| --output-format, -f | No | provider default | png, jpeg or webp; OpenAI only |
| --output-dir, -d | No | current directory | Output directory |
| --timeout-ms, -t | No | 60000 | Request timeout in milliseconds |

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| GEMINI_API_KEY | At least one of GEMINI_API_KEY / OPENAI_API_KEY | Google Gemini API key |
| OPENAI_API_KEY | At least one of GEMINI_API_KEY / OPENAI_API_KEY | OpenAI API key |
| GEMINI_DEFAULT_MODEL | No | Preferred default Gemini model (default gemini-3-pro-image) |
| OPENAI_DEFAULT_MODEL | No | Preferred default OpenAI model (default gpt-image-2) |
| IMAGE_PROVIDER | No | gemini or openai — provider used when --model is omitted |
| IMAGE_OUTPUT_DIR | No | Default output directory (overridden by --output-dir) |
| MEDIA_PIPELINE_LOG_LEVEL | No | Logging level for stderr diagnostics |

### Output

The CLI prints JSON on stdout:

```json
{"success": true, "filePath": "/abs/path/renders/ai/image.png"}
```

or on error:

```json
{"success": false, "errorCode": "CONFIG_ERROR", "error": "Error message"}
```

After a successful run, view the file to check it against the brief before reporting, and
send it to the user. Each generation costs API credit: do not loop or retry silently; make one
image, review it, and ask before producing variants unless the user requested several.

## Aspect ratio selection

- **3:4 / 2:3 / 9:16** — tower portraits and eye-level views of tall buildings
- **16:9** — contextual street or skyline views, presentation boards, hero images
- **1:1** — details, material studies, thumbnails
- **4:3 / 3:2** — general photographic compositions

OpenAI models only support 1024x1024, 1536x1024 and 1024x1536; other ratios are mapped to
the nearest size with a warning.

## Prompt crafting

Use the formula `[Style] [Subject] [Composition] [Context/Atmosphere]` and be concrete about
materials, light, camera position and scale cues. For this project a strong prompt names:

- the design facts (six separate weathered-timber trunks around a hollow void, horizontal ribs
  and bridges crossing the void with planted terraces, narrow recessed glass between ribs, inward
  lean and splintered tips at different heights, flared arched roots landing in reflecting pools,
  warmly lit glass lobby between the roots);
- the setting (downtown Vancouver, surrounding glass towers, snowy North Shore mountains behind);
- the camera and light (eye level from a wet street, overcast soft light, pedestrians for scale);
- the instruction to follow the attached elevation drawing exactly.

See [references/prompt-crafting.md](references/prompt-crafting.md) for more techniques.

## Alternative: MCP tool

The same server is registered in the repository's `.mcp.json` as `media-pipeline`. When it is
approved and running, the tool `mcp__media-pipeline__create_asset` takes `prompt`, `outputPath`,
`aspectRatio`, `model`, `referenceImages` (absolute paths), and the OpenAI-only `mask`,
`background` and `outputFormat`. It writes under `renders/ai/` by default. The CLI is the
preferred route because it needs no server process.
