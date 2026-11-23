# HUD and Controls Refresh — Design (short)

Date: 2026-11-24 · Status: approved by the owner (proposal + two additions)

## Intent
Kids (8–14, Chromebooks, iPads, desktops) need to discover what they can do without reading: zoom, turn the camera, place with one tap, find the keyboard keys, and reach scene settings at a glance. The owner also found two confusions: only one "next" item was visible, and the floor-tile button read as "change the whole ground".

## Decisions
1. **Zoom slider** — vertical slider on the right edge with ＋/－ at its ends; stays in sync with wheel/pinch zoom.
2. **Camera turning is discoverable** — ⟲ ⟳ buttons under the slider turn the view 45° (smoothly); on a child's first visit they pulse gently with a short label "ลากเพื่อหมุนมุมกล้อง" (once per browser).
3. **"แตะพื้นเพื่อเลือกที่วาง" shows only until the first item is ever placed** (remembered per browser).
4. **Tap the ✓ to place** — the ✓ above a valid ghost is a tap/click target that places the item; the วาง button stays as a fallback.
5. **⌨️ shortcuts panel** — a button (shown only when a keyboard/fine pointer is present) opening a list: Enter/Space = วาง, R = หมุนของ, ลูกศร = เลื่อน, Q/E = หมุนกล้อง, ＋/－ = ซูม, Esc = ปิด/ยกเลิก (Q/E and ＋/－ are new keys).
6. **Settings move out to an icon toolbar** — time (cycles dawn → day → dusk → night, icon shows the current), rain toggle, ground colour (popover of swatches), quality toggle (สวย/ลื่น), screenshot, ⌨️, and ⋯ holding เริ่มใหม่ and เคลียร์ (kept one step away so a city isn't wiped by accident; confirms unchanged). Every icon has a Thai label on hover/long-press and as its accessible name. In portrait tablets the toolbar runs vertically on the right.
7. **Next items: show 4** — the current card plus the next four items from the bag (smaller cards; fewer if the bag has fewer; on narrow screens at least 2).
8. **Floor-tile button reads as tile painting** — rename to "ปูกระเบื้อง" with a brush+tile icon, and the whole-map ground icon is labelled "สีพื้นทั้งแผนที่", so the two are never confused.

## Constraints
Thai UI only; touch targets ≥ 48 px; works with mouse, touch and keyboard; no overlap at 1280×720, 1024×768, 768×1024; the gallery page keeps only what applies (no game actions); `?demo=full` unchanged; reduced motion → no pulsing.
