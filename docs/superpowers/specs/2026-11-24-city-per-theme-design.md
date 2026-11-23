# One City per Theme — Design (short)

Date: 2026-11-24 · Status: owner chose option "ก"

## Intent
Kids could not get back to theme select without deleting their city (the only way was ตั้งค่า → เคลียร์, which wipes everything). The owner wants kids to switch themes freely: each theme keeps its own city, so a half-built school is still there after a trip to the zoo.

## Decisions (owner: "ก")
- A visible **🏠 เปลี่ยนธีม** button (HUD, top-left area; also available after a round has finished) returns to theme select immediately — no confirm, nothing is lost.
- **One saved city per theme.** Choosing a theme resumes its city if it has one, otherwise starts a new one. Each city keeps its own placements, bag, floors and scene settings.
- **Theme select shows which themes have a city** (e.g. a badge "สร้างแล้ว 32 ชิ้น", and that the round is finished when it is).
- **เริ่มใหม่** restarts only the current theme's city (confirm text says so). **เคลียร์** deletes every theme's city and returns to theme select (confirm text says "ทุกเมือง").
- **Migration:** an existing save (v1/v2, one city) becomes that theme's city; nothing a child built is lost. A corrupt city is dropped on its own; the others load.
- Reloading the page resumes the theme last played; if the child was on theme select, it opens on theme select.

## Approaches
1. Per-theme cities in one versioned localStorage record (chosen): `{ v: 3, current, cities: { [themeId]: GameState } }` — simple, one write path, migration in one place. Size: ~20 KB per city, well under quota.
2. One localStorage key per theme — more keys to keep consistent; rejected.
3. Delete-on-switch with a confirm (owner's option "ข") — rejected by the owner.

## Constraints
Thai UI, buttons ≥ 48 px; `?demo=full` stays memory-only and never touches saves; save failures keep the existing "saveFailed" notice; e2e covers build-in-A → switch to B → back to A intact, reload, migration from an old save, restart-only-this-theme, clear-all.
