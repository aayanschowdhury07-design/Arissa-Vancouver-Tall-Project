# Hollow Tree Hotel — Vancouver

Procedural 3D model and renders of a 145 m biomimetic timber hotel tower inspired by
Vancouver's Hollow Tree: six slender weathered-timber trunks rising around a hollow central
void, horizontal timber ribs and planted bridges crossing the void, recessed glass between the
ribs, splintered tips at different heights, and flared arched roots landing in shallow
reflecting pools around a warmly lit glass lobby.

## Renders

| File | View |
| --- | --- |
| `renders/hollow-tree-hotel-street-view.png` | Eye-level portrait view from the wet street (2600 × 3250) |
| `renders/hollow-tree-hotel-street-view-wide.png` | Eye-level landscape view (3200 × 1800) |

Both views use a shifted lens (camera held level, frustum offset upward) so the tower's
verticals stay vertical, as in an architectural photograph.

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
2. In the cloud environment settings (environment menu in the session title bar, then Edit), add it
   as a secret or environment variable named `GEMINI_API_KEY` (or `OPENAI_API_KEY`). New sessions
   pick it up. Locally, export the variable in your shell instead.
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
```

`render.js` serves the folder locally and opens it in headless Chromium through Playwright
(WebGL via SwiftShader, so no GPU is needed). Views: `street`, `wide`, `close`. Open
`render/index.html` from any static server to view the scene in a browser.
