# City Builder Game — Design

Date: 2026-11-22 · Status: draft for approval · Repo: `phanuwit13/tower-building` (personal, GitHub)

## 1. Intent

A 3D city-building puzzle game in the browser for **students aged 8–14, played at school**.
A teacher shares one link; kids open it on whatever the school has (laptops, Chromebooks,
iPads/Android tablets) and build a themed city in about one class period.

The twist that makes it a game rather than a scene editor: items are **drawn at random, one at
a time, and every item must be placed** — nothing can be discarded. Kids have to plan where things
go so that later (bigger) items still fit. The round ends when the current item no longer fits;
the game celebrates the finished city and the kid can take a picture of it. There is **no score
or stars** — a better plan simply means a bigger, fuller city.

Success looks like:
- A kid picks a theme and finishes a round without help, and wants to play again.
- It runs smoothly on a typical school Chromebook/tablet and looks good on a decent laptop.
- Nothing about the child leaves the device; no login, no server.
- Refreshing or closing the tab never loses the city.

## 2. Goals

### Themes and items
- 9 themes (Thai UI names): โรงเรียน (school), สวนสนุก (amusement park), คาเฟ่ (cafe),
  หมู่บ้าน (village), โรงพยาบาล (hospital), สวนสัตว์ (zoo), ชายหาดทะเล (beach),
  อวกาศ (space), สวนสาธารณะ (public park).
- **At least 40 distinct 3D items per theme**, each belonging to exactly one theme.
- Every item has: id, Thai display name, footprint (width × depth in tiles), and a category
  tag (e.g. building, nature, seating, food, ride, vehicle, decoration). Category tags are not
  used in v1 scoring; they exist so a neighbour-bonus rule can be added later without touching
  every item again.

### Core loop
1. Choose a theme (start screen). One city uses one theme.
2. The map is a **10 × 10 tile grid**.
3. Items come from a **shuffle bag**: all items of the theme come out once in random order
   before any repeats; the bag then refills and reshuffles.
4. The HUD shows the **current item** and a preview of the **next item** (name, size, thumbnail).
5. Placing: tap/click a tile (or drag the preview) to move a **ghost** of the item there.
   The ghost is green with a ✓ when the spot is free, red with a ✗ when it overlaps or leaves
   the map. Rotate in 90° steps. Press **วาง (Place)** to confirm. Placed items cannot be moved,
   removed or undone.
6. The round ends when the current item cannot fit anywhere on the map in any rotation
   (this includes a completely full map). The end screen says **"เมืองเสร็จแล้ว!" (Your city is
   done!)** — never "Game Over" — with a screenshot button and a restart button.
   After the round ends the city stays on screen; weather/time/ground and the camera still work so
   kids can set up a nice picture.

### No scoring
- **No stars, points or ranking.** *Call:* the end screen shows a neutral summary — how many items
  were placed and how much of the map is used (e.g. "วางไป 34 ชิ้น · ใช้พื้นที่ 87%") — so a kid can
  see that planning paid off; the HUD shows the item count during play. No thresholds, no
  judgement words.

### Scene settings (cosmetic, changeable at any time, no effect on gameplay)
- **Weather:** แดดออก (sunny), ฝนตก (rain).
- **Time of day:** เช้าตรู่ (dawn), กลางวัน (day), หัวค่ำ (dusk), กลางคืน (night).
  Weather and time are independent (rain at night is valid).
- **Ground** (one type for the whole map): หญ้า grass, ดิน dirt, ปูน concrete, ทราย sand,
  หิมะ snow, พื้นไม้ wood deck, พื้นดวงจันทร์ moon surface. Each theme has a sensible default
  (e.g. beach → sand, space → moon surface, cafe → wood deck).

### Screenshot
- A camera button captures the 3D view (without the HUD) as a PNG.
- Desktop: downloads `city-<theme>-<yyyy-mm-dd>.png`. Tablets/phones: opens the system share/save
  sheet when the browser supports sharing files, otherwise downloads.

### Persistence
- Everything is saved to `localStorage` after every action and restored on load: theme, ground,
  weather, time, placed items (id, position, rotation), bag contents, RNG state, current and next
  item and round status.
- **Refreshing must not re-roll the current item** (otherwise refresh becomes a way to skip
  unwanted items).
- **เริ่มใหม่ (Restart):** new empty map, same theme and scene settings. **เคลียร์ (Clear):** delete
  the saved game and return to theme selection. Both ask for confirmation.
- Saved data carries a schema version; an unreadable or old save is discarded gracefully
  (start screen), never a crash.

### Graphics quality (2 tiers)
| Tier | For | Enabled |
|---|---|---|
| **สวย (Pretty)** | capable laptops/desktops | soft shadows, ambient occlusion, bloom for night lights, dense rain |
| **ลื่น (Smooth)** | Chromebooks, older tablets, phones | basic/simple shadows, no post-processing, capped pixel ratio, sparse rain |

- Picked automatically from device signals at start; if the frame rate stays low for a few seconds
  the game drops to ลื่น and shows a short notice. A settings toggle lets the user switch manually.
- The quality preference is a device setting: stored separately and **not** wiped by Clear.

### Look and feel
- **Low-poly, bright, cartoon style**: rounded proportions, a shared palette per theme, flat colours
  (no image textures). Night: lamps/windows glow. Rain: falling drops plus darker sky and wet tint.
- Sky colour, sun/moon position, light colour and fog change with time of day.
- Space theme: the sky is always starry; "rain" is shown as a gentle meteor shower.
- UI is **Thai**, large touch targets (≥ 48 px), works with both mouse and touch, landscape-first
  (portrait phones are best-effort).
- Valid/invalid placement is shown by shape (✓/✗) as well as colour.

## 3. Non-goals (v1)
- Accounts, login, server, database, multiplayer, online gallery or sharing service.
- Sound and music (classroom setting).
- Stars, points, ranking or any scoring (category tags stay on items in case a neighbour-bonus
  rule is wanted later).
- Multiple save slots (one city per browser).
- Undo, moving or deleting placed items; choosing the map size.
- Languages other than Thai.

## 4. Anti-goals (failure even if it "works")
- Any child data or usage data leaving the device; analytics, ads or tracking.
- Runtime requests to third-party servers (fonts, CDNs) — school networks often block them.
- A punishing "you lost" feel.
- Stutter or long loading on school hardware.
- Items across themes that look like they come from different games.
- Content not suitable for kids (weapons, blood, scary medical imagery).

## 5. Constraints
- **Static site, no backend.** Built output is plain files.
- **Hosting: Cloudflare**, connected to the GitHub repo so merging to `main` deploys production
  and pull-request branches get preview links. (Builder's call, confirm against current Cloudflare
  docs during planning: Workers with static assets, which Cloudflare recommends for new static
  sites, or Pages.) *Call:* the owner connects the repo once in the Cloudflare dashboard (Git
  integration); the builder supplies the config. No Cloudflare API tokens are stored in GitHub.
- **Performance budget:** first load ≤ ~1 MB gzipped total; ≥ 30 fps on ลื่น on a typical school
  Chromebook; 60 fps target on สวย on a normal laptop. All models are code-built, so there are no
  model files to download.
- **Target hardware (owner):** the exact school devices are unknown, so budgets are set for the
  **weakest likely device — a 4 GB RAM low-end Chromebook and an older iPad**. Before the remaining
  items are sculpted, the owner (or a teacher) opens the preview link on a real school device
  (see §8 checkpoint).
- **Domain (owner):** start on Cloudflare's free subdomain; at the same checkpoint, open it through
  the school network. If the school filter blocks it, the owner adds their own domain (no code
  change).
- **Browsers:** current Chrome/Edge (incl. ChromeOS), Safari on iPadOS 16+, Chrome on Android. WebGL 2.
- **Fonts:** a Thai-capable open-licence font (e.g. from Google Fonts, OFL) bundled and self-hosted.
- **Repo:** the game lives at the root of this repo next to the existing AI-workflow kit
  (`CLAUDE.md`, `.claude/`, `scripts/wf/`, `docs/ai-workflow/`), which stays untouched.
- **Git flow:** work on a feature branch in a worktree and open a PR; the guard hook blocks pushing
  to `main`, and the owner merges.
- **Process:** the repo's `req-to-mr` skill and `scripts/wf/` are GitLab-only. In this repo the
  workflow's skills (brainstorming, writing-plans, TDD, verification, code review) are used
  **without its GitLab steps** — no issues, claims or MRs, and the `CLAUDE.md` TODO settings stay
  as they are. PRs are on GitHub.

## 6. Approaches considered

| | A. Three.js directly ✅ chosen | B. React Three Fiber | C. Babylon.js engine |
|---|---|---|---|
| 3D | Three.js | Three.js via React components | full engine |
| Menus | plain HTML/CSS | React | engine GUI |
| Download size | smallest | medium (+React) | largest |
| Trade-off | most control, models are small independent files that parallel subagents can write; menus hand-built | comfortable for React devs; more dependencies and a second abstraction layer | many built-ins (shadows, physics); heavier than this game needs |

**Chosen: A**, with the two quality tiers, because the 3D scene is the product and the UI is a
handful of buttons; it is the lightest option for school devices; and per-item model files suit
fanning out to subagents. Visual quality depends on lighting, palette, models and effects, which
A can do as well as the others.

**Models:** each item is TypeScript code that assembles primitives using a shared style kit
(palette, materials, helpers). Rejected: modelling in Blender and exporting `.glb` — needs Blender,
larger downloads, and a consistent style across ~360 items is harder to enforce.

## 7. Decided parts of the how
- **Stack:** TypeScript, Vite, Three.js, Vitest. No UI framework.
- **Separation:** game logic (grid, footprints and rotation, placement validation, "fits anywhere"
  check, seeded RNG and shuffle bag, fill summary, game state transitions, save/load with schema version)
  is pure TypeScript with **no Three.js imports**, built test-first. Rendering, input, UI and
  persistence adapters sit on top.
- **Item model contract** (every item file):
  - exports `id`, Thai `name`, `footprint {w, d}` in tiles, `category`, and `build(kit)` returning
    a Three.js object;
  - 1 tile = 1 world unit; origin at the footprint centre on the ground; must stay entirely
    inside its footprint (no overhang, not even leaves or awnings);
  - uses only the style kit's palette/materials, no textures;
  - a polygon budget per item (builder sets the number so 100 placed items stay within the ลื่น
    frame-rate target);
  - **automated checks** for every item: bounding box within footprint, under the polygon budget,
    only kit materials, unique id, non-empty Thai name.
- **Footprint mix per theme** (guideline so rounds last and planning matters): mostly 1×1 and 1×2,
  some 2×2, a few 2×3 (largest allowed). Exact counts are the builder's call, tuned by simulating
  many rounds with a random placer and a planning placer. *Call — target:* a planning player
  usually fills most of the map (around 80–90 %) and clearly more than a random placer, so
  planning visibly pays off; rounds should not routinely end early on bad luck.
- **Item thumbnails** for the current/next cards are rendered from the same models (no separate
  icon art).
- **Style lock before mass production:** build the style kit and about 6 school items first; the
  owner approves the look (preview link or screenshots) before subagents sculpt the rest.
- **One master palette for all themes** (*call*): themes pick their colours from it rather than
  inventing their own, so approving the look at the style lock covers every theme and no theme
  needs its own palette approval.
- **Subagents sculpt themes in parallel**, one theme per subagent, each following the model
  contract and style kit and passing the automated checks.

## 8. Delivery order
1. **Stage 1 — playable game with the School theme complete**: all core loop, scoring, scene
   settings, quality tiers, screenshot, persistence, deploy to Cloudflare. Includes the style-lock
   checkpoint after the first ~6 items.
2. **Stage 2 — the other 8 themes** (≥ 40 items each), sculpted in parallel by subagents, each
   theme reviewable on its own.

PRs are kept reviewable (*call*), each with a Cloudflare preview link:
- Stage 1 as about four PRs, in order: (a) project scaffold, game logic with tests, Cloudflare
  deploy config; (b) scene, camera, placement input, HUD, settings, persistence, screenshot, using
  placeholder blocks; (c) style kit, master palette and the first ~6 School items → **checkpoint**:
  the owner approves the look (style lock) and opens the preview on a real school device through
  the school network (performance + domain check); (d) the remaining School items and
  quality-tier tuning.
- Stage 2 as one PR per theme.

## 9. Left to the builder
- Exact palette, lighting values, fog, sky colours and effect settings per time of day/weather.
- Camera controls detail (orbit, zoom limits, default angle) and how drag-to-place and
  drag-to-orbit coexist on touch, within the interaction described above.
- Item lists for each theme (names, sizes, categories), following the content rules in §4.
- Device heuristics and FPS thresholds for choosing/dropping the quality tier.
- Polygon budget number, rain/meteor particle counts.
- Exact screen layout and visual design of menus, following §2 Look and feel.
- Test tooling beyond Vitest (e.g. a browser smoke test for save → refresh → restore).

## Owner changes after approval

- 2026-11-23 — map 20 × 20 (was 10 × 10; ~160 items per round; rounds can span more than one class period, the city is saved); every theme has at least 50 items (was 40).
- 2026-11-23 — hover preview on mouse devices (a faint item follows the cursor; click to lock it, วาง/Enter to place); right-drag / two-finger drag pans the camera.
- 2026-11-23 — Stage 2 starts with สวนสนุก (53 items, `docs/game/items-amusement.md`). Theme order: สวนสนุก → สวนสัตว์ → ชายหาดทะเล → คาเฟ่ → หมู่บ้าน → สวนสาธารณะ → โรงพยาบาล → อวกาศ. The owner added บ้านผีสิง, สนามยิงปืน and บ้านยักษ์: allowed as kid-friendly versions (cartoon-spooky with no skulls/blood/gore; fair-ground toy cork guns with tin-can and duck targets, nothing shaped like a real firearm; a fairy-tale giant's house, not a temple ยักษ์) — this narrows the §4 "weapons" anti-goal for toy fair-ground games only.
- 2026-11-23 — สวนสัตว์ has 60 items (owner asked for 10 more than the proposed 50), `docs/game/items-zoo.md`.
