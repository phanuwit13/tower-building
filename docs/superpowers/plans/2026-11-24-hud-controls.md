# HUD and Controls Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Discoverable camera, placement and settings controls for kids.
**Spec:** `docs/superpowers/specs/2026-11-24-hud-controls-design.md`

## Global Constraints
- Branch `feat/hud-controls`. Commits end with the Co-Authored-By trailer; never push.
- Thai UI only; touch targets ≥ 48 px; no overlap at 1280×720, 1024×768, 768×1024; reduced motion respected.
- Browser checks: Playwright's bundled headless Chromium only (no `channel`), one launch per script, never headed, never the real Chrome app or chrome-devtools MCP, never `pkill`.

## Review Focus
1. Zoom slider, wheel and pinch stay in sync; slider never fights the pan clamp.
2. Tapping ✓ places exactly once (no double place with the tap-to-move logic); tapping elsewhere still moves the ghost.
3. Keys don't fire while a dialog, settings popover, floor drawer text, or shortcuts panel is open.
4. First-visit hints show once and never again after the trigger (persisted per browser; storage blocked → hints just show).
5. Toolbar works on touch (long-press labels don't trigger the action).

### Task 1: Camera controls, ✓ to place, one-time hints, new keys
**Files:** `src/render/stage.ts` (zoom/turn API), `src/render/input.ts` (✓ hit target, Q/E, ＋/－), `src/render/city.ts` (✓ sprite hit box), `src/ui/cameraControls.ts` (new: slider, ＋/－, ⟲⟳, first-visit pulse), `src/ui/hud.ts` (hint-once), `src/ui/strings.ts`, `src/main.ts`, styles, tests + e2e.
- [ ] Commit `feat: zoom slider, camera turn buttons and tap-the-check to place`.

### Task 2: Icon toolbar, shortcuts panel, next-four queue, floor button rename
**Files:** `src/ui/toolbar.ts` (new: time/rain/ground/quality/screenshot/⌨️/⋯), `src/ui/shortcuts.ts` (new), `src/ui/settings.ts` (retire or reduce to the ⋯ menu), `src/ui/hud.ts` (next 4 cards; ปูกระเบื้อง button), `src/app/controller.ts` (next-N from the bag), `src/ui/strings.ts`, `src/main.ts`, styles, tests + e2e (updated settings flows).
- [ ] Commit `feat: icon toolbar, keyboard help and the next four items`.
