import * as THREE from 'three';
import type { Page } from '@playwright/test';
import { expect, test, tool } from './fixtures';
import { placementAtTile } from '../src/app/hover';
import { rotatedFootprint } from '../src/game/grid';
import { SAVE_KEY } from '../src/game/save';
import { GRID_SIZE, type GameState } from '../src/game/types';
import { getStyleKit } from '../src/models/kit';
import { rotateMarkAt } from '../src/render/city';
import { CAMERA, distanceOfShare, zoomShareOf } from '../src/render/stage';
import { getCatalog, getTheme } from '../src/themes/registry';
import { T } from '../src/ui/strings';

// Every test boots the 3D game on software WebGL, some twice: slow on CI runners.
test.describe.configure({ timeout: 60_000 });

const placed = (n: number) => `วางแล้ว ${n} ชิ้น`;
const controlsBox = (page: Page) => page.locator('.cam-controls');
/** The camera as the game reports it: azimuth in degrees, distance to the orbit target. */
const azimuth = async (page: Page) => Number(await controlsBox(page).getAttribute('data-azimuth'));
const distance = async (page: Page) => Number(await controlsBox(page).getAttribute('data-distance'));
const slider = (page: Page) => page.getByRole('slider', { name: T.camera.zoom });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
/** Degrees from `a` to `b`, the short way round. */
const turnOf = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;

async function startSchool(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
}

const schoolCity = (page: Page) =>
  page.evaluate((k) => (JSON.parse(localStorage.getItem(k)!) as { cities: { school: GameState } }).cities.school, SAVE_KEY);

/** The starting camera (as the stage sets it up) for the page's viewport. */
function startCamera(page: Page): { camera: THREE.PerspectiveCamera; width: number; height: number } {
  const { width, height } = page.viewportSize()!;
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, width / height, 0.5, 300);
  const centre = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2);
  camera.position.copy(centre).addScaledVector(CAMERA.direction, CAMERA.distance);
  camera.lookAt(centre);
  camera.updateMatrixWorld();
  return { camera, width, height };
}

function onScreen(page: Page, p: THREE.Vector3): { x: number; y: number } {
  const { camera, width, height } = startCamera(page);
  const v = p.clone().project(camera);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
}

/**
 * Tap cell (10, 10) so the ghost goes there, and return where the ghost is and where its ✓ is drawn
 * (city.ts: over the footprint's centre, 0.7 above the item's top), in the starting view; `rotate`:
 * where the rotate button beside it is drawn.
 */
async function ghostWithCheck(page: Page, tap: (p: { x: number; y: number }) => Promise<void>) {
  const game = await schoolCity(page);
  const catalog = getCatalog('school')!;
  const ghost = placementAtTile(game, catalog, 0, 10, 10);
  expect(ghost.valid).toBe(true);
  await tap(onScreen(page, new THREE.Vector3(10.5, 0, 10.5)));
  const item = getTheme('school')!.items.find((i) => i.id === game.current)!;
  const top = new THREE.Box3().setFromObject(item.build(getStyleKit())).max.y;
  const { w, d } = rotatedFootprint(item.footprint, 0);
  const mark = new THREE.Vector3(ghost.x + w / 2, top + 0.7, ghost.z + d / 2);
  return {
    ghost, itemId: item.id, check: onScreen(page, mark),
    rotate: onScreen(page, rotateMarkAt(mark, startCamera(page).camera)),
  };
}

test('the zoom slider moves the camera, and follows the wheel', async ({ page }) => {
  await startSchool(page);
  expect(await distance(page)).toBeCloseTo(CAMERA.distance, 1);
  await expect(slider(page)).toHaveValue(String(Math.round(zoomShareOf(CAMERA.distance) * 100)));

  await slider(page).fill('80');
  await expect.poll(() => distance(page)).toBeCloseTo(distanceOfShare(0.8), 1);

  // The wheel over the map zooms out: the camera moves back and the slider follows it down.
  const { width, height } = page.viewportSize()!;
  await page.mouse.move(width * 0.4, height * 0.6);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => distance(page)).toBeGreaterThan(distanceOfShare(0.8) + 1);
  await expect.poll(async () => Math.abs(Number(await slider(page).inputValue()) - Math.round(zoomShareOf(await distance(page)) * 100)))
    .toBeLessThanOrEqual(1);
  expect(Number(await slider(page).inputValue())).toBeLessThan(80);
});

test('＋ and － zoom a step each way', async ({ page }) => {
  await startSchool(page);
  const d0 = await distance(page);
  await button(page, T.camera.zoomIn).click();
  await expect.poll(() => distance(page)).toBeLessThan(d0 - 1);
  const d1 = await distance(page);
  await button(page, T.camera.zoomOut).click();
  await button(page, T.camera.zoomOut).click();
  await expect.poll(() => distance(page)).toBeGreaterThan(d1 + 1);
});

test('⟲ turns the view 45 degrees one way and ⟳ the other way, about the same spot', async ({ page }) => {
  await startSchool(page);
  const a0 = await azimuth(page);
  const d0 = await distance(page);
  await button(page, T.camera.turnLeft).click();
  await expect.poll(async () => turnOf(a0, await azimuth(page))).toBeCloseTo(-45, 0);
  expect(await distance(page)).toBeCloseTo(d0, 1); // a turn, not a zoom
  await button(page, T.camera.turnRight).click();
  await button(page, T.camera.turnRight).click();
  await expect.poll(async () => turnOf(a0, await azimuth(page))).toBeCloseTo(45, 0);
});

test('Q / E turn and + / - zoom from the keyboard, but not while a toolbar popover is open', async ({ page }) => {
  await startSchool(page);
  const a0 = await azimuth(page);
  await page.keyboard.press('q');
  await expect.poll(async () => turnOf(a0, await azimuth(page))).toBeCloseTo(-45, 0);
  await page.keyboard.press('e');
  await page.keyboard.press('e');
  await expect.poll(async () => turnOf(a0, await azimuth(page))).toBeCloseTo(45, 0);

  const d0 = await distance(page);
  await page.keyboard.press('+');
  await expect.poll(() => distance(page)).toBeLessThan(d0 - 1);
  const d1 = await distance(page);
  await page.keyboard.press('-');
  await page.keyboard.press('-');
  await expect.poll(() => distance(page)).toBeGreaterThan(d1 + 1);
  const d2 = await distance(page);
  await page.keyboard.press('=');
  await expect.poll(() => distance(page)).toBeLessThan(d2 - 1);

  await tool(page, T.ground.title).click();
  // The '=' zoom may still be gliding on a loaded machine (the poll above passes mid-glide): let it land first.
  await page.waitForTimeout(600);
  const a1 = await azimuth(page);
  const d3 = await distance(page);
  for (const key of ['q', 'e', '+', '-']) await page.keyboard.press(key);
  await page.waitForTimeout(600); // longer than a glide
  expect(await azimuth(page)).toBe(a1);
  expect(await distance(page)).toBe(d3);
});

test('a click on the rotate button beside the ✓ turns the item once; placing keeps the turn', async ({ page }) => {
  await startSchool(page);
  const { itemId, rotate } = await ghostWithCheck(page, (p) => page.mouse.click(p.x, p.y));
  await expect(button(page, T.place)).toBeEnabled();
  await page.mouse.move(rotate.x, rotate.y);
  await expect.poll(() => page.locator('canvas').evaluate((c) => (c as HTMLCanvasElement).style.cursor)).toBe('pointer');
  await page.mouse.click(rotate.x, rotate.y);
  await page.waitForTimeout(300);
  await expect(page.getByText(placed(0))).toBeVisible(); // turning never places
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(1))).toBeVisible();
  const city = await schoolCity(page);
  expect(city.placements.map(({ itemId: id, rotation }) => ({ id, rotation }))).toEqual([{ id: itemId, rotation: 1 }]);
});

test('a click on the ✓ places the item once, where the ghost was', async ({ page }) => {
  await startSchool(page);
  const { ghost, itemId, check } = await ghostWithCheck(page, (p) => page.mouse.click(p.x, p.y));
  await expect(button(page, T.place)).toBeEnabled(); // the ghost is there and valid
  await page.mouse.click(check.x, check.y);
  await expect(page.getByText(placed(1))).toBeVisible();
  await page.waitForTimeout(300);
  await expect(page.getByText(placed(1))).toBeVisible(); // once, not twice
  const city = await schoolCity(page);
  expect(city.placements.map(({ itemId: id, x, z, rotation }) => ({ id, x, z, rotation })))
    .toEqual([{ id: itemId, x: ghost.x, z: ghost.z, rotation: 0 }]);
});

test('a drag that starts on the ✓ moves the ghost (the camera keeps still); a tap on it still places once', async ({ page }) => {
  await startSchool(page);
  const { ghost, check } = await ghostWithCheck(page, (p) => page.mouse.click(p.x, p.y));
  const a0 = await azimuth(page);
  await page.mouse.move(check.x, check.y);
  await page.mouse.down();
  await page.mouse.move(check.x + 160, check.y + 20, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByText(placed(0))).toBeVisible(); // a drag never places
  expect(await azimuth(page)).toBe(a0); // and never turns the camera
  await page.keyboard.press('Enter'); // the ghost went elsewhere: placing now lands away from where the tap put it
  await expect(page.getByText(placed(1))).toBeVisible();
  const city = await schoolCity(page);
  expect([city.placements[0].x, city.placements[0].z]).not.toEqual([ghost.x, ghost.z]);
});

test('holding Q does not spin the view: one 45 degree step; a press in the middle of a turn ends on the step', async ({ page }) => {
  await startSchool(page);
  const a0 = await azimuth(page);
  await page.keyboard.down('q');
  for (let i = 0; i < 5; i++) await page.keyboard.down('q'); // auto-repeat
  await page.keyboard.up('q');
  await page.waitForTimeout(600);
  expect(turnOf(a0, await azimuth(page))).toBeCloseTo(-45, 0);
  // a turn, then a tap on the map while it glides: the turn finishes on its 45 degrees
  await page.keyboard.press('e');
  const { width, height } = page.viewportSize()!;
  await page.mouse.click(width * 0.3, height * 0.5);
  await page.waitForTimeout(600);
  expect(turnOf(a0, await azimuth(page))).toBeCloseTo(0, 0);
});

test.describe('touch (iPad 1024 x 768)', () => {
  test.use({ viewport: { width: 1024, height: 768 }, hasTouch: true });

  test('a finger tap on the ✓ places the item once, where the ghost was', async ({ page }) => {
    await startSchool(page);
    const { ghost, itemId, check } = await ghostWithCheck(page, (p) => page.touchscreen.tap(p.x, p.y));
    await expect(button(page, T.place)).toBeEnabled();
    await page.touchscreen.tap(check.x, check.y);
    await expect(page.getByText(placed(1))).toBeVisible();
    await page.waitForTimeout(300);
    await expect(page.getByText(placed(1))).toBeVisible();
    const city = await schoolCity(page);
    expect(city.placements.map(({ itemId: id, x, z }) => ({ id, x, z }))).toEqual([{ id: itemId, x: ghost.x, z: ghost.z }]);
  });
});

test('"แตะพื้นเพื่อเลือกที่วาง" shows until the first item is placed, then never again (reload, another theme)', async ({ page }) => {
  await startSchool(page);
  const hint = page.getByText(T.hintTap);
  await expect(hint).toBeVisible();
  await page.keyboard.press('ArrowRight'); // a ghost: the hint steps aside
  await expect(hint).toBeHidden();
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(1))).toBeVisible();
  await expect(hint).toBeHidden(); // no ghost again, but the hint has done its job
  await page.reload();
  await expect(page.getByText(placed(1))).toBeVisible();
  await expect(hint).toBeHidden();
  await page.getByRole('button', { name: T.home }).click();
  await page.getByRole('button', { name: 'สวนสัตว์' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  await expect(hint).toBeHidden();
});

test('first visit: ⟲ ⟳ pulse with "ลากเพื่อหมุนมุมกล้อง" until the camera is turned by a drag; gone after a reload', async ({ page }) => {
  await startSchool(page);
  const label = page.getByText(T.camera.dragHint);
  await expect(label).toBeVisible();
  await expect(button(page, T.camera.turnLeft)).toHaveClass(/pulse/);
  await expect(button(page, T.camera.turnRight)).toHaveClass(/pulse/);

  // Drag across the map (the left button orbits).
  const { width, height } = page.viewportSize()!;
  await page.mouse.move(width * 0.35, height * 0.55);
  await page.mouse.down();
  await page.mouse.move(width * 0.55, height * 0.55, { steps: 10 });
  await page.mouse.up();
  await expect(label).toBeHidden();
  await expect(button(page, T.camera.turnLeft)).not.toHaveClass(/pulse/);

  await page.reload();
  await expect(page.getByText(placed(0))).toBeVisible();
  await expect(button(page, T.camera.turnLeft)).toBeVisible();
  await expect(label).toBeHidden();
  await expect(button(page, T.camera.turnRight)).not.toHaveClass(/pulse/);
});

test('storage blocked: the hints still show, and go for this visit once done', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('blocked', 'SecurityError'); };
  });
  await startSchool(page);
  const label = page.getByText(T.camera.dragHint);
  await expect(label).toBeVisible();
  await expect(page.getByText(T.hintTap)).toBeVisible();
  await page.keyboard.press('e');
  await expect(label).toBeHidden();
});

test('reduced motion: no pulsing (a still ring instead) and the turn is instant', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await startSchool(page);
  const left = button(page, T.camera.turnLeft);
  await expect(left).toHaveClass(/pulse/);
  expect(await left.evaluate((b) => getComputedStyle(b).animationName)).toBe('none');
  const a0 = await azimuth(page);
  await left.click();
  expect(turnOf(a0, await azimuth(page))).toBeCloseTo(-45, 0); // already there: no glide
});

test('the camera controls step aside on theme select and while the floor drawer is open', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(T.pickTheme)).toBeVisible();
  await expect(slider(page)).toBeHidden();
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await expect(slider(page)).toBeVisible();
  await page.getByRole('button', { name: T.floor.open, exact: true }).click();
  await expect(page.getByRole('region', { name: T.floor.title })).toBeVisible();
  await expect(slider(page)).toBeHidden();
  await expect(button(page, T.camera.turnLeft)).toBeHidden();
  const a0 = await azimuth(page);
  await page.keyboard.press('e'); // the drawer keeps its own keys
  await page.waitForTimeout(600);
  expect(await azimuth(page)).toBe(a0);
  await page.keyboard.press('Escape');
  await expect(slider(page)).toBeVisible();
});

// The right-edge controls and the first-visit label on a laptop, an iPad (landscape) and a tablet held upright.
for (const viewport of [{ width: 1280, height: 720 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }]) {
  test.describe(`${viewport.width} x ${viewport.height}`, () => {
    test.use({ viewport });

    test('the camera controls are 48 px or more, on screen, and cover nothing in the HUD', async ({ page }) => {
      await startSchool(page);
      await expect(page.getByText(T.camera.dragHint)).toBeVisible();
      await expect(page.getByText(T.hintTap)).toBeVisible();
      const rects = (sel: string) => page.locator(sel).evaluateAll((els) => els
        .filter((e) => !e.closest('[hidden]'))
        .map((e) => { const r = e.getBoundingClientRect(); return { name: e.getAttribute('aria-label') ?? e.textContent ?? e.className, x: r.x, y: r.y, w: r.width, h: r.height }; }));
      const mine = await rects('.cam-controls button, .cam-slider-box, .cam-hint');
      const hud = await rects('.hud .card, .hud .hud-placed, .hud .hud-hint, .hud button, .toolbar .tb-btn');
      expect(mine).toHaveLength(6); // ＋, slider, －, label, ⟲, ⟳
      expect(hud.length).toBeGreaterThan(6);
      for (const m of mine) {
        expect(m.x >= 0 && m.y >= 0 && m.x + m.w <= viewport.width && m.y + m.h <= viewport.height, `${m.name} off screen`).toBe(true);
        if (m.name !== T.camera.dragHint) {
          expect(m.w, m.name).toBeGreaterThanOrEqual(48);
          expect(m.h, m.name).toBeGreaterThanOrEqual(48);
        }
        for (const o of hud) {
          const apart = m.x >= o.x + o.w || m.x + m.w <= o.x || m.y >= o.y + o.h || m.y + m.h <= o.y;
          expect(apart, `${m.name} overlaps ${o.name}`).toBe(true);
        }
      }
    });
  });
}
