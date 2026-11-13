# Revit + Geopogo build sheet

Compiled 13 Nov 2026 from five concept docs: Exterior Concept (6 Nov), Level 1 The Seafloor,
Level 2 The Living Water, Level 3 The Forest Floor, Top of Tower The Nest.
Where docs disagree, the Exterior Concept is treated as final because it is the latest dated.

Everything marked **(assumed)** is not in the docs. It is a number that fits the stated
heights, to be replaced when you confirm the real one.

## 1. Levels

Tower: 72 floors, 304.8 m cap. Type these into an elevation view (`LL`).

| Revit level | Elevation | Floor to floor | Source |
| --- | --- | --- | --- |
| L1 Seafloor (lobby) | 0.0 m | 8.5 m | L1 doc |
| L2 Living Water (spa) | +8.5 m | 4.1 m | L2 doc |
| L3 Forest Floor (ballroom, conference main) | +12.6 m | 9.3 m (9–9.5) | L3 doc |
| L3 upper conference | +17.25 m | half of L3 | L3 doc |
| L4 | +21.9 m | 7.6 m **(assumed, see gap 1)** | follows from above |
| L5, top of base, trunk splits | +29.5 m | 3.3 m **(assumed)** | Exterior doc |
| L5–L59 typical floors | array at 3.3 m **(assumed)** | | not in docs |
| M1 sky lobby, outrigger bridge | **unknown** | 7.5 m **(assumed)** | not in docs |
| M2 sky lobby, outrigger bridge, moving fins start | +149.0 m | 7.5 m **(assumed)** | Exterior doc |
| M3 outrigger bridge, split ends | +226.0 m | 6.3 m | Exterior doc |
| F60–F61 corporate suites | +232.3, +236.1 m | 3.8 m | Nest doc |
| F62–F67 premium suites | +239.9 to +258.9 m | 3.8 m | Nest doc |
| F68 ultra-lux | +262.7 m | 4.6 m | Nest doc |
| F69 bridal | +267.3 m | 4.6 m | Nest doc |
| F70 ultra-lux | +271.9 m | 4.6 m | Nest doc |
| F71 public sky lounge | +276.5 m | 5.0 m | Nest doc |
| F72 top suite | +281.5 m | 5.0 m | Nest doc |
| Roof / courtyard glass roof | +286.5 m | | Nest doc |
| Crown tip | +304.8 m | | Exterior doc |

Why 3.3 m and 7.5 m: 55 typical floors at 3.3 m plus two 7.5 m mechanical floors fill the
196.5 m between +29.5 and +226 exactly, with L5–L38 below M2 and L39–L59 above it.
The docs do not state either number.

## 2. Plan set-out

Model with plan north up (Stanley Park side at the top). Then set True North 45° clockwise
from plan north, so the Stanley Park side faces northwest and sun studies are right.

| Item | Size | Source |
| --- | --- | --- |
| Site block | 144.8 m east–west × 79.2 m north–south | L1 doc |
| Root ring (outer feet of the eight roots) | about 100 × 64 m | Exterior doc, open item |
| Roots | 8, four per half, mirrored, about 33 m apart | Exterior doc |
| Root arch openings | about 25 m wide, up to 24 m tall | Exterior doc |
| The split | 4 m glazed slot running north–south, L5 to M3 | Exterior doc |
| Halves | west half and east half, three trunks each | Exterior doc |
| Lobby clearing | 35–40 m across | L1 doc, open item |
| Lobby column ring | 6 columns, ring 20–24 m across, shaft 1.3 m, 6.1 m tall | L1 doc |
| Main entrance bridge | about 12 m wide × 8 m long, pool 2 m below street | Exterior doc |
| North face to North Street | about 11 m | L3 doc |
| Ballroom | about 900 m², 7.6 m clear, at the north (back) of the base | L3 doc |
| Top suite floor (F72) | about 700 m², ring 10–12 m deep around the courtyard | Nest doc |

Root openings, clockwise from the high street:

| Opening | Use |
| --- | --- |
| South centre (high street) | Main entrance and bridge, under the split |
| SW corner | Transit pavilion |
| West (arterial) | Drop-off porte-cochère, garage ramp |
| NW | Walkway and pool |
| North centre (Stanley Park side) | Ballroom stair and lift, under the split |
| NE corner | Loading dock |
| East | Walkway and pool |
| SE | Walkway and pool |

## 3. Build order

1. **Levels and set-out** from sections 1 and 2.
2. **Exterior massing**, as conceptual masses lofted through profiles at L1, L5, M2, M3, F72
   and the crown: the base trunk with eight roots, the two three-trunk halves, the slot, the
   three outrigger bridges, the crown spires. Smaller bridges every four floors can be one
   family arrayed up the slot.
3. **First Geopogo exterior image.** This replaces the "approved six-trunk render" the prompt
   rules call for, which predates the split. Use it as the reference for every later shot.
4. **Exterior shots** from the shot list in section 5.
5. **Interiors, only the rooms that get an image**: the L1 lobby clearing, the L3 ballroom,
   the F72 great room, the F71 sky lounge, and the L2 pool hall if a board has room.
   Model each as a room on its own level. Leave L5–L59 as mass floors.
6. **Kinetic fins** on one glazed bay above M2, never the whole tower.

## 4. Gaps and conflicts to settle

Gaps (not in any of the five docs):

1. **L4.** No height or programme. The Nest doc says the base came out 1.5–2 m shorter than
   the 3 Oct stack, while the Exterior doc still puts the top of the base at +29.5 m.
   Fastest fix: keep +29.5, +149, +226 and +276.5 as they are and let L4 absorb the
   difference, so nothing above the base moves.
2. **Typical floor height for L5–L59, and the elevation of M1.**
3. **Tower plan dimensions above the base**: the footprint of each half, the size of the
   trunks, and the size of the hollow. The exterior cannot be modelled accurately without
   these. The only clue is F72: 700 m² with a 10–12 m deep ring is roughly a 31 m wide plate
   around a 9 m courtyard.
4. **Floors 4–59 programme** (workplace floor, standard rooms, sky lobbies). The docs refer
   to a "Sea to Sky" doc and a Level 4 chat that were not uploaded.
5. **Crown**: number and heights of the spires.

Conflicts:

1. **Guest lifts T3/T4.** L1 and L3 put them on the north side; L2 puts them on the west.
   The Exterior doc gives one to each half, which matches the north side.
2. **Root pool planting.** L1 proposes skunk cabbage and salal; the Exterior doc's plant
   palette is later and does not include skunk cabbage.
3. **Elevated walkway.** L1 and L2 mention one; the Exterior doc describes a ground-level
   covered ring and boardwalk instead.

Resolved by reading the docs together: the Nest doc asks whether the suite floors sit in the
split zone. They do not. The split ends at M3 (+226 m) and F60 starts at +232.3 m.

## 5. Geopogo prompts

Rules from the Exterior doc: paste the fixed description into every prompt, never use the
three banned words, no logos or text, morning light on the high-street face, afternoon light
on the arterial face.

**Fixed tower description**

> A 305 m, 72-storey hotel tower shaped like Stanley Park's Hollow Tree. At the base, one
> solid flared trunk about 30 m tall stands on eight arched concrete roots that land in
> shallow reflecting pools. Above the base the trunk splits into two halves of three trunks
> each, six trunks in all, separated by a narrow 4 m full-height glazed slot lined in warm
> red cedar and framed by stacked pointed arches. Bridges cross the slot: three large ones,
> the upper two at about half and three-quarters of the height, and smaller ones every four
> floors. Between the trunks, recessed glazed bays hold slender vertical timber louvres
> within the bark slits. The cladding is weathered grey-brown cedar bark with silver-grey
> ridges, mid-tone and lighter than the low-reflectance glass. Toward the top the bark
> strips thin and the glass widens, and the trunks gather into a crown of tall splintered
> spires of different heights, open to the sky between them. No logos, signage or text.

**Fixed setting**

> An inland downtown Vancouver block. Low heritage buildings line the far side of the retail
> high street. Towers of similar height stand on the neighbouring blocks. The North Shore
> mountains appear only in the far distance, in views looking that way.

**Shots** (add each line after the two fixed blocks)

| # | Shot line |
| --- | --- |
| 1 | Queen Elizabeth Park skyline: edit the brief's reference photo, looking north, keeping the photo's own light. Insert the tower among towers of similar height, seen at 45° so the slot reads as a seam. |
| 2 | Hero: camera raised about 100 m, facing the high-street face. Bright overcast morning. The whole tree from roots to crown, the glazed split with bridges and arches, louvres edge-on. |
| 3 | Eye level from the high-street sidewalk beside the heritage buildings, autumn rain. Water pouring from root spouts into the pools, two low sheet waterfalls beside a wide entrance bridge, people sheltering under the arches, red vine maples, looking up the split. |
| 4 | Eye level from the arterial bike lane, sunny afternoon. Drop-off under a root arch, bike hub, bigleaf maples, a cedar nurse log, louvres angled on the sunlit face. |
| 5 | From the transit plaza across the intersection, spring morning. A small glass transit pavilion under a root arch, camas in bloom, commuters crossing. |
| 6 | From the plaza across the north street, night. Ballroom entrance and grand stair, young cedars, low warm downward lighting, the red-cedar split glowing up the tower. |
| 7 | Camera raised about 10 m, three-quarter view from the high-street and east-street corner, clear summer morning. The wide bridge between its two waterfalls, pools wrapping the base, people crossing. |

Shots 3 and 7 both show the main entrance; drop one if time runs short.

**Kinetic animation** (one bay above M2)

> One glazed bay between two bark-clad trunks. Slender vertical louvres, the same width and
> colour as the bark strips, recessed so they never project past the bark face. They start
> edge-on with a clear view through. They hold still, then turn in a slow wave that climbs
> the bay from bottom to top, angling only as far as the sun requires. They hold again, then
> close fully as night falls on the empty rooms. The range of movement grows toward the top.
