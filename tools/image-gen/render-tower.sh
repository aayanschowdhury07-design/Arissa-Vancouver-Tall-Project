#!/usr/bin/env bash
# Generate an AI street-level render of the Hollow Tree Hotel from the agreed brief,
# using the five design boards as reference images.
#
# usage: tools/image-gen/render-tower.sh [output-name] [aspect-ratio] [extra CLI args...]
#   output-name   file name without extension (default: hollow-tree-hotel-ai-street-view)
#   aspect-ratio  1:1, 16:9, 9:16, 4:3, 3:4, 2:3, 3:2 (default: 3:4)
# Credentials: GEMINI_API_KEY (default provider) or OPENAI_API_KEY (pass --model gpt-image-2).
# In a Claude cloud environment the key can instead be a Network secret for
# generativelanguage.googleapis.com (header x-goog-api-key, no prefix); the proxy attaches it,
# so a placeholder value is exported here to satisfy the CLI's presence check.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NAME="${1:-hollow-tree-hotel-ai-street-view}"; ASPECT="${2:-3:4}"; shift $(( $# > 2 ? 2 : $# )) || true
OUT_DIR="$ROOT/renders/ai"; mkdir -p "$OUT_DIR"
REFS=$(ls "$ROOT"/reference/design-boards/*.webp | head -5 | paste -sd, -)
# Route Node's fetch through the HTTPS proxy when one is configured (Node ignores HTTPS_PROXY otherwise).
export NODE_USE_ENV_PROXY=1
if [ -z "${GEMINI_API_KEY:-}" ] && [ -z "${OPENAI_API_KEY:-}" ]; then export GEMINI_API_KEY="managed-by-network-secret"; fi
# Pin the SDKs to the official endpoints: ignore any inherited gateway overrides.
unset OPENAI_BASE_URL OPENAI_CUSTOM_HEADERS GOOGLE_GEMINI_BASE_URL GOOGLE_VERTEX_BASE_URL GOOGLE_GENAI_USE_VERTEXAI
PROMPT='Photorealistic architectural render, eye level from a wet downtown Vancouver street, overcast soft light, snowy North Shore mountains behind, surrounding glass towers, pedestrians with umbrellas for scale. A supertall hotel tower built from six separate slender trunks of weathered timber that rise together around a hollow central void, like the split trunk of Vancouver'"'"'s Hollow Tree. Tall vertical openings between the trunks reveal the hollow interior, where horizontal timber ribs and bridges cross the void at regular intervals with planted terraces on them. Narrow recessed glass sits between the timber ribs. The trunks lean slightly inward as they rise so the tower tapers, and at the top the trunks separate into individual splintered tips at different heights. At the ground the trunks flare outward into thick arched roots that land in shallow reflecting pools around the base, with a warmly lit glass lobby visible between the roots. Follow the attached elevation drawing exactly for proportions, trunk count, taper and root form. Vertical lines kept vertical, high dynamic range, realistic wet reflections.'
exec node "$ROOT/tools/image-gen/cli.bundle.js" \
  --prompt "$PROMPT" \
  --aspect-ratio "$ASPECT" \
  --reference-images "$REFS" \
  --output-dir "$OUT_DIR" \
  --output "$OUT_DIR/$NAME.png" \
  --timeout-ms 240000 \
  "$@"
