# Floor Tiles (freestyle) — Design

Date: 2026-11-23 · Status: approved by the owner (approach 1, rectangle painting "ค", camera toggle "ก") · Builds on: `2026-11-22-city-builder-game-design.md` (Stage 1) and `2026-11-23-item-animation-design.md` (animation, PR #6)

## Intent
Kids want to decorate their city freely, like laying floors in The Sims: paths between buildings, a brick plaza, a wooden deck, a lawn. The random-item puzzle stays as it is; floor tiles are a separate, free creative layer with many looks (wood, concrete, dirt, stone, …). It comes before the other 8 themes so every theme gets it.

## Goals (owner-decided)
- A separate **floor-tile catalogue**, opened from its own panel (not the random shuffle bag). Free: unlimited, any tile, any time.
- **Many looks** — about 34 tiles in 5 groups (list below).
- **Placement like The Sims (owner chose "ค")**: tap = one tile; drag = a rectangle of tiles (a row = a path, a block = a plaza), with a live preview of the rectangle before release.
- Built as **low-poly 3D tiles sculpted with the style kit**, like items (owner chose approach 1).

## Builder calls (owner can correct)
- Tiles are shared by **all themes** (not theme items; they don't count toward a theme's 50).
- One tile per 1 × 1 cell, laid **over the map ground** (the whole-map ground in settings stays as the base).
- Tiles can go **under items already placed** and items can be placed on tiles; tiles never block items and never affect the puzzle, the fill %, or when a round ends.
- **Eraser** removes tiles (rectangle too). Painting over a tile replaces it.
- Floor mode works while playing **and after the round has finished**.
- **Saved** with the game (localStorage). **เริ่มใหม่** clears tiles too; **เคลียร์** deletes everything. Old saves load with no tiles (save migration, never wipe a kid's city).
- Tile water uses the animation system's water shimmer (both tiers); tiles cast no shadows (they receive them).
- A drag rectangle covers every cell in it, including cells under items (so a fountain can stand on a brick plaza); the preview shows the whole rectangle and the tile count; the eraser works the same way. Dragging back to the start cell, or a second finger landing, cancels the stroke.
- The เริ่มใหม่ confirm text mentions that the floor is cleared too.

## Tile list (draft, 34)
| Group | Tiles |
|---|---|
| ไม้ (5) | ไม้กระดานสีอ่อน, ไม้กระดานสีเข้ม, ไม้ปาร์เก้ก้างปลา, ไม้ระแนงระเบียง (gaps), ไม้ปาร์เก้ตาราง |
| ปูน/กระเบื้อง (8) | ปูนเรียบ, แผ่นปูนสี่เหลี่ยม, กระเบื้องขาว, กระเบื้องหมากรุก, กระเบื้องหกเหลี่ยม, กระเบื้องลายฟ้าขาว, หินขัด, ยางมะตอย |
| หิน/อิฐ (8) | อิฐแดง, อิฐก้างปลา, กรวด, หินก้อนกลม, หินแผ่นธรรมชาติ, หินทางเดินบนหญ้า, บล็อกตัวหนอน, บล็อกหญ้า |
| ดิน/หญ้า (7) | ดิน, ดินโคลน, ทราย, หญ้าสนาม, หญ้ามีดอกไม้, แปลงดินยกร่อง, ใบไม้ร่วง |
| พิเศษ (6) | น้ำตื้นระยิบระยับ, พื้นยางสนามเด็กเล่น, พรมแดง, หิมะ, ตั้งเตแปะ (hopscotch), ทางสีรุ้ง |

## Screen
```
[พื้น] button bottom-left → a bottom drawer slides up:
┌───────────────────────────────────────────────────┐
│ ไม้ | ปูน/กระเบื้อง | หิน/อิฐ | ดิน/หญ้า | พิเศษ   [ยางลบ] [เสร็จ] │
│ [▦][▦][▦][▦][▦][▦][▦][▦]  ← swatches scroll sideways         │
└───────────────────────────────────────────────────┘
```
Swatches are thumbnails rendered from the tile models (same thumbnailer as items) with a Thai name. While the drawer is open the item cards and หมุน/วาง are hidden. **Camera in floor mode (owner chose "ก")**: the drawer has a tool toggle 🖌 ปูพื้น / ✋ ขยับกล้อง, like a drawing app. In 🖌 (the default when a swatch or the eraser is picked) one finger / left mouse paints; in ✋ the normal camera controls work. Two-finger touch gestures move the camera in either tool, and the mouse wheel always zooms. Buttons ≥ 48 px, Thai only.

## Approaches
1. **Sculpted tiles via the style kit (chosen).** Each tile is a 1 × 1 low-poly model (planks with grooves, raised bricks, stepping stones…), merged into chunks like items. Same look as every item, reuses the kit, palette, validation, thumbnails and parallel sculptors; costs more vertices, so attribute packing comes first and tiles stay lean.
2. Shader-drawn patterns on flat quads. Cheapest and easiest to multiply, but flat "printed" floors that don't match the chunky items, plus a second pattern system to maintain. Rejected.
3. Hybrid of 1 and 2. Two systems for little gain. Rejected.

## Constraints
- Smooth tier: a **fully tiled 20 × 20 map plus the full demo item set** still ≥ 30 fps on a 4 GB Chromebook; draw calls grow by a small constant (floor chunks), not per tile.
- **Pack vertex attributes first** (animation carry-forward: ~40 → ~24 B/vertex, `anim.x == 0` early-out) — tiles multiply vertices.
- Per-tile triangle budget (builder sets, low — a tile is seen many times); tile top surface stays low so items standing on tiles don't look buried and tiles don't z-fight the ground.
- Painting a big rectangle must not stutter: rebuild only the affected floor chunks, separate from item chunks.
- Master palette: tiles use it; at most 4 new colours (e.g. asphalt, mud), shown to the owner in the PR preview (owner can ask for tweaks there).
- Tile tops stay ≤ 0.03 above the ground (relief included ≤ 0.05) and items stay at y = 0, so items on tiles never look buried; the item-vs-ground colour-contrast test does not apply to tiles.
- Save: a v2 save format that still loads v1 saves (no tiles); tiles stored per cell and validated like placements; a finished game stays editable for floors.
- Swatch thumbnails come from the existing thumbnailer, rendered lazily per group when the drawer first shows it.
- Attribute packing ships as the first task of this same branch/PR.
- Kit/palette/validate/parts stay controller-owned; sculptors follow `docs/game/sculpting.md` (gets a floor-tile section).
- Content rules unchanged (no royal/religious imagery).

## Non-goals
Auto-connecting roads with lane markings; walls/fences drawn by dragging; tile rotation per cell (patterns are symmetric or fixed); undo history; floors per theme.

## Left to the builder
Exact tile shapes/heights/colours, triangle budget, drawer animation and layout details, how the rectangle preview looks (semi-transparent tiles + outline), chunking of the floor layer, save format details (with migration).
