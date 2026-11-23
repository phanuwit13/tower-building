import * as THREE from 'three';
import type { CDPSession, Page } from '@playwright/test';
import { expect, fromMore, test } from './fixtures';
import { FLOOR_GROUPS, FLOOR_TILES } from '../src/floors';
import { paintRect, rectCells, type FloorRect } from '../src/game/floors';
import { demoFullGame } from '../src/game/demo';
import { placeCurrent } from '../src/game/game';
import { buildOccupancy, nearestFreeSpot } from '../src/game/grid';
import { encodeSave, SAVE_KEY } from '../src/game/save';
import { GRID_SIZE, type GameState } from '../src/game/types';
import { CAMERA } from '../src/render/stage';
import { viewShiftPx } from '../src/render/viewShift';
import { getCatalog } from '../src/themes/registry';
import { drawerGroups } from '../src/ui/floorDrawer';
import { floorCountLabel, T } from '../src/ui/strings';

// Every test boots the 3D game on software WebGL (some twice) and drags pointers across it: slow on CI runners.
test.describe.configure({ timeout: 60_000 });

const groups = drawerGroups(FLOOR_GROUPS, FLOOR_TILES);
const firstTile = groups[0].tiles[0];
const brick = FLOOR_TILES.find((t) => t.id === 'brick-red')!;
const groupName = (id: string) => FLOOR_GROUPS.find((g) => g.id === id)!.name;
const RECT: FloorRect = { x0: 7, z0: 7, x1: 9, z1: 10 }; // 3 x 4, in the middle of the screen

/**
 * How much of the bottom of the screen the open drawer covers, as main.ts reckons it: its height plus the
 * gap it floats above the edge (read from layout, so a drawer still sliding in counts in full); 0 while hidden.
 */
const drawerCover = (page: Page): Promise<number> => page.locator('.floor-drawer').evaluate((e: HTMLElement) =>
  (e.hidden ? 0 : e.offsetHeight + (parseFloat(getComputedStyle(e).bottom) || 0)));

/**
 * Where a cell's centre is on screen while the camera is still in its starting view. With the floor
 * drawer open the view rides up by half of what the drawer covers (viewShiftPx), so that is taken off,
 * once the view has glided there (#app data-view-shift).
 */
async function cellOnScreen(page: Page, tx: number, tz: number): Promise<{ x: number; y: number }> {
  const { width, height } = page.viewportSize()!;
  const cover = await drawerCover(page);
  const shift = cover ? viewShiftPx(cover, height) : 0;
  await expect(page.locator('#app')).toHaveAttribute('data-view-shift', String(shift));
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, width / height, 0.5, 300);
  const centre = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2);
  camera.position.copy(centre).addScaledVector(CAMERA.direction, CAMERA.distance);
  camera.lookAt(centre);
  camera.updateMatrixWorld();
  const p = new THREE.Vector3(tx + 0.5, 0, tz + 0.5).project(camera);
  return { x: ((p.x + 1) / 2) * width, y: ((1 - p.y) / 2) * height - shift };
}

/** The School city's saved floors: cell indices per tile id. */
async function savedFloors(page: Page): Promise<Record<string, number[]>> {
  const floors = await page.evaluate((k) => {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as { cities: { school?: { floors: (string | null)[] } } }).cities.school?.floors ?? null : null;
  }, SAVE_KEY);
  const out: Record<string, number[]> = {};
  floors?.forEach((id, i) => { if (id) (out[id] ??= []).push(i); });
  return out;
}

/** The HUD's [ปูกระเบื้อง] that opens the drawer (the drawer's paint tool has the same name; only one shows at a time). */
const floorsButton = (page: Page) => page.locator('.hud').getByRole('button', { name: T.floor.open, exact: true });
const drawerOf = (page: Page) => page.getByRole('region', { name: T.floor.title });

async function startSchool(page: Page): Promise<void> {
  await page.goto('/');
  await expect(floorsButton(page)).toBeHidden(); // never on theme select
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await expect(page.getByText('วางแล้ว 0 ชิ้น')).toBeVisible();
}

async function mouseDrag(page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
}

test('floor drawer: starts on the first tile, a 3 x 4 drag paints 12 cells that survive a reload', async ({ page }) => {
  await startSchool(page);
  await floorsButton(page).click();
  const drawer = drawerOf(page);
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('button', { name: firstTile.name })).toHaveAttribute('aria-pressed', 'true');
  await expect(drawer.getByRole('button', { name: T.floor.paint })).toHaveAttribute('aria-pressed', 'true');
  // the item cards and หมุน/วาง step aside
  await expect(page.getByRole('button', { name: T.place })).toBeHidden();
  await expect(page.getByRole('button', { name: T.rotate })).toBeHidden();
  await expect(page.getByTestId('current-name')).toBeHidden();
  await expect(floorsButton(page)).toBeHidden();

  await drawer.getByRole('button', { name: groupName(brick.group) }).click();
  await drawer.getByRole('button', { name: brick.name }).click();
  await mouseDrag(page, await cellOnScreen(page, RECT.x0, RECT.z0), await cellOnScreen(page, RECT.x1, RECT.z1));
  await expect(page.locator('.floor-count')).toHaveText(floorCountLabel(12));
  await page.mouse.up();
  await expect(page.locator('.floor-count')).toHaveText(floorCountLabel(1)); // the stroke is done; the mouse hover is back
  expect(await savedFloors(page)).toEqual({ [brick.id]: rectCells(RECT) });

  // After a reload the city keeps its floor: one more tap saves the loaded floor plus the new cell.
  await page.reload();
  await floorsButton(page).click();
  const tap = await cellOnScreen(page, 12, 4);
  await page.mouse.click(tap.x, tap.y);
  expect(await savedFloors(page)).toEqual({ [brick.id]: rectCells(RECT), [firstTile.id]: [4 * GRID_SIZE + 12] });
});

test('floor drawer: the eraser clears a rectangle; เสร็จ brings the items back', async ({ page }) => {
  await startSchool(page);
  await floorsButton(page).click();
  await drawerOf(page).getByRole('button', { name: groupName(brick.group) }).click();
  await drawerOf(page).getByRole('button', { name: brick.name }).click();
  await mouseDrag(page, await cellOnScreen(page, RECT.x0, RECT.z0), await cellOnScreen(page, RECT.x1, RECT.z1));
  await page.mouse.up();
  expect(await savedFloors(page)).toEqual({ [brick.id]: rectCells(RECT) });

  // The eraser clears a 2 x 2 rectangle inside the bricks.
  await drawerOf(page).getByRole('button', { name: T.floor.eraser }).click();
  await mouseDrag(page, await cellOnScreen(page, 8, 8), await cellOnScreen(page, 9, 9));
  await expect(page.locator('.floor-count')).toHaveText(floorCountLabel(4));
  await page.mouse.up();
  const erased = new Set(rectCells({ x0: 8, z0: 8, x1: 9, z1: 9 }));
  expect((await savedFloors(page))[brick.id]).toEqual(rectCells(RECT).filter((i) => !erased.has(i)));

  // เสร็จ brings the items back
  await drawerOf(page).getByRole('button', { name: T.floor.done }).click();
  await expect(drawerOf(page)).toBeHidden();
  await expect(page.getByRole('button', { name: T.place })).toBeVisible();
  await expect(floorsButton(page)).toBeVisible();
});

test('floor drawer: the view rides up with the drawer, so a cell that the drawer would cover can be painted, and the mouse hover shows one cell; Escape closes the drawer', async ({ page }) => {
  await startSchool(page);
  await floorsButton(page).click();
  const drawer = drawerOf(page);
  await expect(drawer).toBeVisible();
  const { height } = page.viewportSize()!;
  const cover = await drawerCover(page);
  const top = height - cover; // the drawer's top edge (it may still be sliding in)
  // A cell that only the shift brings clear of the drawer: under its top edge in the starting view, above it now.
  const shift = viewShiftPx(cover, height);
  let cellIndex = -1;
  let corner = { x: 0, y: 0 };
  for (let tz = GRID_SIZE - 1; tz >= 0 && cellIndex < 0; tz--) {
    const p = await cellOnScreen(page, GRID_SIZE - 1, tz);
    if (p.y < top - 20 && p.y + shift > top) { cellIndex = tz * GRID_SIZE + GRID_SIZE - 1; corner = p; }
  }
  expect(cellIndex).toBeGreaterThanOrEqual(0);

  await page.mouse.move(corner.x, corner.y);
  await expect(page.locator('.floor-count')).toHaveText(floorCountLabel(1)); // the hover preview
  const bar = (await drawer.boundingBox())!;
  await page.mouse.move(bar.x + bar.width / 2, top + 20); // over the drawer (it floats in the middle): gone
  await expect(page.locator('.floor-count')).toBeHidden();
  await page.mouse.click(corner.x, corner.y);
  expect(await savedFloors(page)).toEqual({ [firstTile.id]: [cellIndex] });

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(page.getByRole('button', { name: T.place })).toBeVisible();
});

test('เริ่มใหม่ says the floor goes too, and clears it', async ({ page }) => {
  await startSchool(page);
  await floorsButton(page).click();
  const tap = await cellOnScreen(page, 10, 10);
  await page.mouse.click(tap.x, tap.y);
  expect(await savedFloors(page)).toEqual({ [firstTile.id]: [10 * GRID_SIZE + 10] });

  await fromMore(page, T.restart);
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(T.confirmRestart)).toBeVisible();
  await dialog.getByRole('button', { name: T.confirmRestartOk }).click();
  await expect(page.getByText('วางแล้ว 0 ชิ้น')).toBeVisible();
  expect(await savedFloors(page)).toEqual({});
  await expect(drawerOf(page)).toBeHidden(); // a new city starts with the items
  await expect(page.getByRole('button', { name: T.place })).toBeVisible();
});

test('after the round has finished, [พื้น] is there once the end screen is dismissed, and painting works', async ({ page }) => {
  // The ?demo=full city with its last item placed: a finished round, saved for real so it can be read back.
  const catalog = getCatalog('school')!;
  const demo = demoFullGame(catalog, { weather: 'sunny', time: 'day', ground: 'grass' }, 1);
  const fp = catalog.items[demo.current].footprint;
  const occ = buildOccupancy(demo.placements, catalog);
  const rotation = nearestFreeSpot(occ, fp, 0, 10, 10) ? 0 : 1;
  const spot = nearestFreeSpot(occ, fp, rotation, 10, 10)!;
  const finished = placeCurrent(demo, catalog, spot.x, spot.z, rotation)!;
  expect(finished.status).toBe('finished');

  await page.goto('/');
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVE_KEY, encodeSave({ current: 'school', cities: { school: finished }, unreadable: {} })]);
  await page.reload();
  await expect(page.getByText(T.endTitle)).toBeVisible();
  await page.getByRole('button', { name: T.viewCity }).click();
  await floorsButton(page).click();
  await mouseDrag(page, await cellOnScreen(page, RECT.x0, RECT.z0), await cellOnScreen(page, RECT.x1, RECT.z1));
  await expect(page.locator('.floor-count')).toHaveText(floorCountLabel(12));
  await page.mouse.up();
  // The demo is already floored: the drag replaces the rectangle's tiles, the rest stays.
  const expected: Record<string, number[]> = {};
  paintRect(finished.floors, RECT, firstTile.id).forEach((id, i) => { if (id) (expected[id] ??= []).push(i); });
  expect(await savedFloors(page)).toEqual(expected);
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!).cities.school as GameState, SAVE_KEY);
  expect(saved.status).toBe('finished');
  expect(saved.placements).toEqual(finished.placements);
});

// iPad landscape with touch: a finger paints, a second finger hands the gesture to the camera, ✋ orbits.
test.describe('touch (iPad 1024 x 768)', () => {
  test.use({ viewport: { width: 1024, height: 768 }, hasTouch: true });

  type Point = { x: number; y: number };
  const touches = async (page: Page) => {
    const cdp: CDPSession = await page.context().newCDPSession(page);
    const send = (type: 'touchStart' | 'touchMove' | 'touchEnd', pts: Point[]) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, id) => ({ x: p.x, y: p.y, id })) });
    return {
      down: (...pts: Point[]) => send('touchStart', pts),
      async move(from: Point[], to: Point[], steps = 8) {
        for (let i = 1; i <= steps; i++) {
          await send('touchMove', from.map((f, k) => ({ x: f.x + ((to[k].x - f.x) * i) / steps, y: f.y + ((to[k].y - f.y) * i) / steps })));
        }
      },
      up: () => send('touchEnd', []),
      async tap(p: Point) { await send('touchStart', [p]); await send('touchEnd', []); },
    };
  };
  /** The camera has settled (damping) once a frame or two have passed with no input. */
  const settle = (page: Page) => page.waitForTimeout(800);

  test('one finger paints a rectangle; a second finger cancels the stroke and moves the camera', async ({ page }) => {
    await startSchool(page);
    await floorsButton(page).tap();
    await expect(drawerOf(page)).toBeVisible();
    const t = await touches(page);

    const a = await cellOnScreen(page, RECT.x0, RECT.z0);
    const b = await cellOnScreen(page, RECT.x1, RECT.z1);
    await t.down(a);
    await t.move([a], [b]);
    await expect(page.locator('.floor-count')).toHaveText(floorCountLabel(12));
    await t.up();
    expect(await savedFloors(page)).toEqual({ [firstTile.id]: rectCells(RECT) });

    // A stroke, then a second finger: the preview goes and the two fingers pan the map.
    const c = await cellOnScreen(page, 12, 4);
    const d = await cellOnScreen(page, 14, 7);
    await t.down(c);
    await t.move([c], [d]);
    await expect(page.locator('.floor-count')).toBeVisible();
    const e = { x: d.x + 80, y: d.y };
    await t.down(d, e);
    await expect(page.locator('.floor-count')).toBeHidden();
    await t.move([d, e], [{ x: d.x - 160, y: d.y - 40 }, { x: e.x - 160, y: e.y - 40 }]);
    await t.up();
    await settle(page);
    expect(await savedFloors(page)).toEqual({ [firstTile.id]: rectCells(RECT) }); // nothing new

    // The camera moved: a tap where cell (10, 10) used to be now paints another cell.
    await t.tap(await cellOnScreen(page, 10, 10));
    const painted = (await savedFloors(page))[firstTile.id];
    expect(painted).toHaveLength(13);
    expect(painted).not.toContain(10 * GRID_SIZE + 10);
  });

  test('the ✋ tool: one finger orbits the camera and paints nothing', async ({ page }) => {
    await startSchool(page);
    await floorsButton(page).tap();
    const drawer = drawerOf(page);
    await drawer.getByRole('button', { name: T.floor.camera }).tap();
    await expect(drawer.getByRole('button', { name: T.floor.camera })).toHaveAttribute('aria-pressed', 'true');
    const t = await touches(page);
    const a = await cellOnScreen(page, 7, 7);
    await t.down(a);
    await t.move([a], [{ x: a.x + 220, y: a.y }]);
    await t.up();
    await settle(page);
    expect(await savedFloors(page)).toEqual({});

    // Back to 🖌: a tap where cell (7, 7) used to be paints another cell, the view has turned.
    await drawer.getByRole('button', { name: T.floor.paint }).tap();
    await t.tap(a);
    const painted = (await savedFloors(page))[firstTile.id];
    expect(painted).toHaveLength(1);
    expect(painted).not.toContain(7 * GRID_SIZE + 7);
  });
});

test('opening the floor drawer leaves the counter where it was, and the view glides up instead of jumping', async ({ page }) => {
  await startSchool(page);
  const counter = page.locator('.hud-placed');
  const before = (await counter.boundingBox())!;
  // every lift the page applies, from before the click (a MutationObserver misses none, however slow the frames)
  await page.evaluate(() => {
    const app = document.getElementById('app')!;
    const w = window as unknown as { lifts: number[] };
    w.lifts = [];
    new MutationObserver(() => w.lifts.push(Number(app.dataset.viewShift))).observe(app, { attributeFilter: ['data-view-shift'] });
  });
  await floorsButton(page).click();
  await expect(drawerOf(page)).toBeVisible();
  const end = viewShiftPx(await drawerCover(page), page.viewportSize()!.height);
  await expect(page.locator('#app')).toHaveAttribute('data-view-shift', String(end));
  const lifts = await page.evaluate(() => (window as unknown as { lifts: number[] }).lifts);
  expect(lifts.at(-1)).toBe(end);
  expect(lifts.some((v) => v > 0 && v < end)).toBe(true); // passed through on the way up
  for (let i = 1; i < lifts.length; i++) expect(lifts[i]).toBeGreaterThanOrEqual(lifts[i - 1]);
  expect(await counter.boundingBox()).toEqual(before);
});

test('floor drawer: a bar floating clear of the screen edges, the same size in every group, every swatch the same size (labels on two lines do not shift the layout)', async ({ page }) => {
  await startSchool(page);
  await floorsButton(page).click();
  const drawer = drawerOf(page);
  const { width, height } = page.viewportSize()!;
  const sizes: string[] = [];
  for (const g of FLOOR_GROUPS) {
    const tab = drawer.getByRole('button', { name: g.name, exact: true });
    if (!(await tab.isVisible())) continue;
    await tab.click();
    await expect(drawer).toHaveCSS('opacity', '1'); // slid in
    const box = (await drawer.boundingBox())!;
    expect(box.x, g.name).toBeGreaterThan(8);
    expect(box.x + box.width, g.name).toBeLessThan(width - 8);
    expect(Math.abs(box.x + box.width / 2 - width / 2), `${g.name}: centred`).toBeLessThan(2);
    expect(height - (box.y + box.height), `${g.name}: off the bottom edge`).toBeGreaterThan(8);
    const swatches = await drawer.locator('.floor-swatch').evaluateAll((els) =>
      els.map((e) => { const r = e.getBoundingClientRect(); const img = e.querySelector('img')!.getBoundingClientRect(); return `${Math.round(r.height)}/${Math.round(img.top - r.top)}`; }));
    expect(new Set(swatches).size, `${g.name}: ${swatches.join(' ')}`).toBe(1);
    sizes.push(`${Math.round(box.width)}x${Math.round(box.height)}|${swatches[0]}`);
  }
  expect(new Set(sizes).size, sizes.join(' ')).toBe(1);
});

test('floor drawer: the tools have line icons, and with ✋ the mouse over the map is an open hand, a closed one while it drags', async ({ page }) => {
  await startSchool(page);
  await floorsButton(page).click();
  const drawer = drawerOf(page);
  for (const name of [T.floor.paint, T.floor.camera]) await expect(drawer.getByRole('button', { name, exact: true }).locator('svg')).toBeVisible();
  const canvas = page.locator('canvas').first();
  const cursor = () => canvas.evaluate((e) => getComputedStyle(e).cursor);
  const p = await cellOnScreen(page, 10, 8);
  await page.mouse.move(p.x, p.y);
  expect(await cursor()).toBe('auto');
  await drawer.getByRole('button', { name: T.floor.camera, exact: true }).click();
  await page.mouse.move(p.x, p.y);
  expect(await cursor()).toBe('grab');
  await page.mouse.down();
  expect(await cursor()).toBe('grabbing');
  await page.mouse.move(p.x + 80, p.y);
  await page.mouse.up();
  expect(await cursor()).toBe('grab');
  await drawer.getByRole('button', { name: T.floor.done, exact: true }).click();
  expect(['auto', 'pointer']).toContain(await cursor()); // the item rules again (a hand only over the ✓)
});
