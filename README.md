# Hollow Tree Hotel — Vancouver

Procedural 3D model and renders of a 145 m biomimetic timber hotel tower inspired by
Vancouver's Hollow Tree: six slender weathered-timber trunks rising around a hollow central
void, horizontal timber ribs and planted bridges crossing the void, recessed glass between the
ribs, splintered tips at different heights, and flared arched roots landing in shallow
reflecting pools around a warmly lit glass lobby.

## Renders

| File | View |
| --- | --- |
| `renders/hollow-tree-hotel-street-view.png` | Eye-level portrait from the wet street, overcast (2600 × 3250) |
| `renders/hollow-tree-hotel-street-view-wide.png` | Eye-level landscape from further down the street (3200 × 1800) |
| `renders/hollow-tree-hotel-night.png` | Night view: lit interiors, uplit roots, street lamps, bloom (2600 × 3250) |
| `renders/hollow-tree-hotel-base.png` | Base at street scale: arched roots, reflecting pools, glass lobby (3200 × 1800) |
| `renders/hollow-tree-hotel-atrium.png` | Looking up the hollow void from the lobby clearing (2400 × 3000) |
| `renders/hollow-tree-hotel-aerial.png` | Aerial over downtown toward the North Shore mountains (3200 × 1800) |
| `renders/hollow-tree-hotel-elevation.png` | Rendered front elevation, orthographic, after the elevation board (2400 × 3000) |
| `renders/hollow-tree-hotel-plan.png` | Rendered roof plan, orthographic top view, north up (3000 × 3000) |

Perspective street views use a shifted lens (camera held level, frustum offset upward) so the
tower's verticals stay vertical, as in an architectural photograph. All views get ground-truth
ambient occlusion; the night view adds bloom.

## AI image generation (media-pipeline skill)

The repository carries a project install of the
[claude-image-gen](https://github.com/guinacio/claude-image-gen) plugin so Claude Code sessions in
this repo can generate photoreal AI views with Google Gemini (or OpenAI) image models:

- `.claude/skills/image-generation/` — the skill, with paths adapted to this repo
- `tools/image-gen/cli.bundle.js` — the standalone CLI the skill runs (`bundle.js` is the MCP server,
  registered in `.mcp.json` as `media-pipeline`; see `tools/image-gen/NOTICE.md` for provenance)
- `reference/design-boards/` — the five design boards, usable as reference images
- `renders/ai/` — where generated images are saved

### Setup

1. Get a Gemini API key at https://aistudio.google.com/apikey (or an OpenAI key).
2. In the cloud environment settings (environment menu in the session title bar, then Edit), store
   it one of two ways:
   - **Network secret** (the key never enters the session): allowed website
     `generativelanguage.googleapis.com`, custom header name `x-goog-api-key`, prefix empty, value =
     the key. The agent proxy attaches it to requests; the tooling here exports a placeholder
     `GEMINI_API_KEY` and sets `NODE_USE_ENV_PROXY=1` so Node's fetch goes through that proxy.
   - **Environment variable** `GEMINI_API_KEY` (or `OPENAI_API_KEY`), readable by sessions.
   Locally, export the variable in your shell.
3. OpenAI only: the environment's network policy must allow `api.openai.com` (Gemini's host
   `generativelanguage.googleapis.com` is already reachable).

### Use

```bash
# the agreed street-level brief with all five design boards as references (portrait)
tools/image-gen/render-tower.sh hollow-tree-hotel-ai-street-view 3:4

# any other image
node tools/image-gen/cli.bundle.js --prompt "..." --aspect-ratio 16:9 \
  --reference-images reference/design-boards/05-elevations-and-section.webp \
  --output-dir renders/ai --output renders/ai/my-image.png
```

Or just ask Claude for an AI render in this repo; the skill triggers on that request.

## How it is built

`render/scene.js` is a Three.js scene generated entirely from parameters taken off the
elevation drawings (145 m top, +105 / +65 / +25 m tower zones, ~45 m base, 6 trunks):

- **Trunks** — a lobed cross-section swept along a curve whose radius from the tower axis
  decays exponentially with height, so the trunks flare at the ground and lean inward as they
  rise. Each trunk carries bundled vertical "stipe" strands and ends in splintered tips of
  different heights.
- **Roots** — four arched legs per trunk that spring from the lower trunk and land in the
  pool ring; the lobby glass drum sits between them.
- **Interior** — six room sectors (floor plates, recessed glass, warm ceiling light) attached
  to the trunks, leaving open slots into the hollow void. Thin timber ribs run around the
  tower at every floor; heavy ribs with bridges and planted terraces cross the void at eight
  levels.
- **Context** — a wet street with puddle reflections (planar reflector under an alpha-mapped
  asphalt layer), reflecting pools, glass towers with spandrel-band curtain walls, North Shore
  mountains with a snow line, street trees, lamps, cars and pedestrians for scale, under a
  soft overcast sky.

## Rendering

```bash
cd render
npm install
node render.js --view street --w 2600 --h 3250 --out ../renders/hollow-tree-hotel-street-view.png
node render.js --view wide   --w 3200 --h 1800 --out ../renders/hollow-tree-hotel-street-view-wide.png
node render.js --view night  --w 2600 --h 3250 --out ../renders/hollow-tree-hotel-night.png
```

`render.js` serves the folder locally and opens it in headless Chromium through Playwright
(WebGL via SwiftShader, so no GPU is needed). Views: `street`, `wide`, `close`, `night`, `base`, `atrium`, `aerial`, `elevation`, `plan`.
Pass `--time night` to light any view at night, or `--ao 0` to skip ambient occlusion. Open
`render/index.html` from any static server to view the scene in a browser.
