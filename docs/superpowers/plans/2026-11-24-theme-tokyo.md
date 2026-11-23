# Tokyo Theme (Stage 2, theme 10) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The เมืองโตเกียว theme (theme id `tokyo`): Japan's capital with lots of tall buildings and neon, Tokyo Tower and a Japanese temple, 60 items, playable from theme select.

**Architecture:** The generic theme pipeline; `'tokyo'` added to `ThemeId`; concrete ground; a bright neon night (`nightGlow` 1.5, like the shopping district).

**Tech Stack:** TypeScript 7, Three.js 0.187, Vite 8, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-city-builder-game-design.md` + item list `docs/game/items-tokyo.md` (owner request 2026-11-24: "เมืองหลวงญี่ปุ่น แบบมีตึกเยอะๆ tokyo tower วัดญี่ปุ่น" with "เริ่มทำได้เลย"; the list was drafted by Claude and not reviewed by the owner — flag it in the morning summary).

## Global Constraints
- Branch `feat/theme-tokyo` (worktree `.claude/worktrees/tokyo`). Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; path-limited; never `--amend`; never `git add -f`. The controller opens and merges the PR once every gate passes.
- Item rules: `docs/game/sculpting.md`; ids, names, footprints, categories, animations, batches exactly as the doc.
- Content (ruling: the owner asked for a Japanese temple by name, so its architecture is allowed for this theme only): the temple and pagoda are architecture only — no Buddha or deity statues, altars, offerings, incense, prayer boards, fortune slips, no Shinto shrine gates; no text or letters of any script (no kanji/kana/Latin); no brands or logos; no copyrighted characters; no lucky-cat charm; no gambling (no pachinko or prize machines); no alcohol; no people.
- Other themes unchanged (snapshots pass unregenerated).
- Browser checks: Playwright's bundled headless Chromium only, one launch per script, never headed, never `pkill`/`killall`; no per-item sweeps.

## Review Focus
1. It reads as Tokyo from the default camera: tall buildings, Tokyo Tower, the pagoda, neon.
2. The night is bright and colourful (lit windows, neon icon signs, lanterns), never white blobs.
3. No kanji/letters sneak into signs; no religious objects beyond temple architecture.
4. Tall items (tower ~4, skyscraper ≤ 4.5) stay under the 5 cap and don't swamp the camera.
5. Saved cities of every other theme still load; theme select works for all.

### Task 1: Tokyo scaffold — `ThemeId` + `'tokyo'`; id `tokyo`, เมืองโตเกียว, 🗼, concrete, `nightGlow` 1.5.
### Tasks 2–8: Sculpt batches t1 … t7 (parallel)
### Task 9: Register, snapshot, e2e, demo check, PR, CI, merge
