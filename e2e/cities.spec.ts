import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { FLOOR_TILES } from '../src/floors';
import { demoFullGame } from '../src/game/demo';
import { newGame, placeCurrent } from '../src/game/game';
import { buildOccupancy, nearestFreeSpot } from '../src/game/grid';
import { encodeSave, SAVE_KEY } from '../src/game/save';
import { GRID_SIZE, type Catalog, type GameState } from '../src/game/types';
import { getCatalog } from '../src/themes/registry';
import { zoo as zooTheme } from '../src/themes/zoo';
import { builtLabel, T } from '../src/ui/strings';

// Every test boots the 3D game on software WebGL, several times: slow on CI runners.
test.describe.configure({ timeout: 60_000 });

const placed = (n: number) => `วางแล้ว ${n} ชิ้น`;
const SCHOOL = 'โรงเรียน';
const ZOO = 'สวนสัตว์';
const hud = (page: Page) => page.locator('.hud');
const homeButton = (page: Page) => hud(page).getByRole('button', { name: T.home });
const themeCard = (page: Page, name: string) => page.locator('.theme-card', { hasText: name });
const drawerOf = (page: Page) => page.getByRole('region', { name: T.floor.title });

/** The saved record, as the next page load reads it. */
const savedRecord = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), SAVE_KEY);

/** The current item goes on the nearest free spot (keyboard: the ghost appears, Enter places it). */
async function placeOne(page: Page, n: number): Promise<void> {
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(n))).toBeVisible();
}

async function goHome(page: Page): Promise<void> {
  await homeButton(page).click();
  await expect(page.getByText(T.pickTheme)).toBeVisible();
}

async function pick(page: Page, name: string, n: number): Promise<void> {
  await themeCard(page, name).click();
  await expect(page.getByText(placed(n))).toBeVisible();
}

/** A city with `n` items on it, built in code (the way the game places them). */
function cityWith(catalog: Catalog, n: number, settings: GameState['settings'], seed: number): GameState {
  let s = newGame(catalog, settings, seed);
  for (let i = 0; i < n; i++) {
    const spot = nearestFreeSpot(buildOccupancy(s.placements, catalog), catalog.items[s.current].footprint, 0, GRID_SIZE / 2, GRID_SIZE / 2)!;
    s = placeCurrent(s, catalog, spot.x, spot.z, 0)!;
  }
  return s;
}

test('every theme keeps its own city: โรงเรียน → 🏠 → สวนสัตว์ → 🏠 → โรงเรียน is exactly as left, and a reload keeps both', async ({ page }) => {
  await page.goto('/');
  await expect(homeButton(page)).toBeHidden(); // never on theme select
  await pick(page, SCHOOL, 0);
  await placeOne(page, 1);
  await placeOne(page, 2);
  await page.getByRole('button', { name: T.settings }).click();
  await page.locator('.chip', { hasText: new RegExp(`^${T.time.night}$`) }).click();
  await page.getByRole('button', { name: T.close }).click();
  // a floor tile, and 🏠 pressed with the floor drawer still open
  await page.getByRole('button', { name: T.floor.open, exact: true }).click();
  await expect(drawerOf(page)).toBeVisible();
  const { width, height } = page.viewportSize()!;
  await page.mouse.click(width / 2, height / 2);
  await expect.poll(async () => (await savedRecord(page)).cities.school.floors.filter(Boolean).length).toBe(1);
  const schoolItem = await page.getByTestId('current-name').textContent();
  const school = (await savedRecord(page)).cities.school as GameState;
  expect(school.placements).toHaveLength(2);
  expect(school.settings.time).toBe('night');

  await goHome(page);
  await expect(themeCard(page, SCHOOL)).toContainText(builtLabel(2));
  await expect(themeCard(page, ZOO)).not.toContainText('สร้างแล้ว');
  expect(await savedRecord(page)).toEqual({ v: 3, current: null, cities: { school } });

  await pick(page, ZOO, 0);
  expect(zooTheme.items.map((i) => i.name)).toContain(await page.getByTestId('current-name').textContent());
  await placeOne(page, 1);
  const zoo = (await savedRecord(page)).cities.zoo as GameState;
  await goHome(page);
  await expect(themeCard(page, SCHOOL)).toContainText(builtLabel(2));
  await expect(themeCard(page, ZOO)).toContainText(builtLabel(1));
  await expect(page.locator('.theme-done:visible')).toHaveCount(0); // no round is finished

  await pick(page, SCHOOL, 2);
  await expect(page.getByTestId('current-name')).toHaveText(schoolItem!);
  await expect(drawerOf(page)).toBeHidden(); // the drawer shut when the theme changed: the city opens with its items
  await expect(page.getByRole('button', { name: T.place })).toBeVisible();
  expect(await savedRecord(page)).toEqual({ v: 3, current: 'school', cities: { school, zoo } });
  await page.getByRole('button', { name: T.settings }).click();
  await expect(page.locator('.chip.selected', { hasText: new RegExp(`^${T.time.night}$`) })).toBeVisible();
  await page.getByRole('button', { name: T.close }).click();

  // A reload opens on the theme last played, both cities kept
  await page.reload();
  await expect(page.getByText(placed(2))).toBeVisible();
  await expect(page.getByTestId('current-name')).toHaveText(schoolItem!);
  expect(await savedRecord(page)).toEqual({ v: 3, current: 'school', cities: { school, zoo } });
  // ...and on theme select when the child was there
  await goHome(page);
  await page.reload();
  await expect(page.getByText(T.pickTheme)).toBeVisible();
  await expect(themeCard(page, SCHOOL)).toContainText(builtLabel(2));
  await expect(themeCard(page, ZOO)).toContainText(builtLabel(1));
  await pick(page, ZOO, 1);
});

test('an old one-city save (v2) becomes that theme\'s city: nothing a child built is lost', async ({ page }) => {
  const old = cityWith(getCatalog('zoo')!, 3, { weather: 'rain', time: 'dusk', ground: 'grass' }, 5);
  old.floors[3 * GRID_SIZE + 4] = FLOOR_TILES[0].id;
  const v2 = JSON.stringify({ v: 2, state: old }); // what the game saved before every theme kept its own city
  await page.goto('/');
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVE_KEY, v2]);
  await page.reload();

  await expect(page.getByText(placed(3))).toBeVisible(); // opens on the old city
  await expect(page.getByTestId('current-name')).toHaveText(zooTheme.items.find((i) => i.id === old.current)!.name);
  await goHome(page);
  await expect(themeCard(page, ZOO)).toContainText(builtLabel(3));
  expect(await savedRecord(page)).toEqual({ v: 3, current: null, cities: { zoo: old } });

  // a new city next to it
  await pick(page, SCHOOL, 0);
  await placeOne(page, 1);
  await goHome(page);
  await expect(themeCard(page, ZOO)).toContainText(builtLabel(3));
  await expect(themeCard(page, SCHOOL)).toContainText(builtLabel(1));
  expect((await savedRecord(page)).cities.zoo).toEqual(old);
});

test('เริ่มใหม่ starts only this theme\'s city again', async ({ page }) => {
  await page.goto('/');
  await pick(page, SCHOOL, 0);
  await placeOne(page, 1);
  await goHome(page);
  const school = (await savedRecord(page)).cities.school as GameState;
  await pick(page, ZOO, 0);
  await placeOne(page, 1);
  await placeOne(page, 2);

  await page.getByRole('button', { name: T.settings }).click();
  await page.getByRole('button', { name: T.restart }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(T.confirmRestart)).toBeVisible();
  await dialog.getByRole('button', { name: T.confirmRestartOk }).click();
  await expect(page.getByText(placed(0))).toBeVisible();

  await goHome(page);
  await expect(themeCard(page, SCHOOL)).toContainText(builtLabel(1));
  await expect(themeCard(page, ZOO)).toContainText(builtLabel(0));
  expect((await savedRecord(page)).cities.school).toEqual(school);
});

test('เคลียร์ deletes every theme\'s city and goes back to theme select', async ({ page }) => {
  await page.goto('/');
  await pick(page, SCHOOL, 0);
  await placeOne(page, 1);
  await goHome(page);
  await pick(page, ZOO, 0);
  await placeOne(page, 1);

  await page.getByRole('button', { name: T.settings }).click();
  await page.getByRole('button', { name: T.clear }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(T.confirmClear)).toBeVisible();
  expect(T.confirmClear).toContain('ทุกเมือง');
  await dialog.getByRole('button', { name: T.confirmClearOk }).click();

  await expect(page.getByText(T.pickTheme)).toBeVisible();
  await expect(page.locator('.theme-built:visible')).toHaveCount(0);
  expect(await page.evaluate((k) => localStorage.getItem(k), SAVE_KEY)).toBeNull();
  await page.reload();
  await expect(page.getByText(T.pickTheme)).toBeVisible();
  await expect(page.locator('.theme-built:visible')).toHaveCount(0);
  await pick(page, SCHOOL, 0);
});

test('after the round has finished, 🏠 is on the end screen and in the HUD, and theme select says the city is finished', async ({ page }) => {
  // The ?demo=full city with its last item placed: a finished round.
  const catalog = getCatalog('school')!;
  const demo = demoFullGame(catalog, { weather: 'sunny', time: 'day', ground: 'grass' }, 1);
  const fp = catalog.items[demo.current].footprint;
  const occ = buildOccupancy(demo.placements, catalog);
  const rotation = nearestFreeSpot(occ, fp, 0, 10, 10) ? 0 : 1;
  const spot = nearestFreeSpot(occ, fp, rotation, 10, 10)!;
  const finished = placeCurrent(demo, catalog, spot.x, spot.z, rotation)!;
  expect(finished.status).toBe('finished');
  await page.goto('/');
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVE_KEY, encodeSave({ current: 'school', cities: { school: finished } })]);
  await page.reload();

  const endScreen = page.locator('.end-screen');
  await expect(endScreen.getByText(T.endTitle)).toBeVisible();
  await endScreen.getByRole('button', { name: T.home }).click();
  await expect(page.getByText(T.pickTheme)).toBeVisible();
  const card = themeCard(page, SCHOOL);
  await expect(card).toContainText(builtLabel(finished.placements.length));
  await expect(card.locator('.theme-done')).toHaveText(T.cityDone);

  await card.click();
  await expect(endScreen.getByText(T.endTitle)).toBeVisible();
  await endScreen.getByRole('button', { name: T.viewCity }).click();
  await goHome(page);
  expect(await savedRecord(page)).toEqual({ v: 3, current: null, cities: { school: finished } });
});

test('?demo=full stays in memory: 🏠 and another theme never touch the saved cities', async ({ page }) => {
  test.setTimeout(60_000);
  const mine = encodeSave({ current: null, cities: { zoo: cityWith(getCatalog('zoo')!, 2, { weather: 'sunny', time: 'day', ground: 'grass' }, 3) } });
  await page.goto('/');
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVE_KEY, mine]);
  await page.goto('/?demo=full');
  await expect(page.getByTestId('current-name')).toBeVisible();
  await goHome(page);
  await expect(themeCard(page, ZOO)).not.toContainText('สร้างแล้ว'); // the demo knows nothing of the player's cities
  await pick(page, ZOO, 0);
  await placeOne(page, 1);
  expect(await page.evaluate((k) => localStorage.getItem(k), SAVE_KEY)).toBe(mine);
});

// 🏠 top left, clear of everything else, on a laptop, an iPad (landscape) and a tablet held upright.
for (const viewport of [{ width: 1280, height: 720 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }]) {
  test.describe(`${viewport.width} x ${viewport.height}`, () => {
    test.use({ viewport });

    test('🏠 เปลี่ยนธีม is 48 px or more, top left, on screen, and covers nothing', async ({ page }) => {
      await page.goto('/');
      await pick(page, SCHOOL, 0);
      await placeOne(page, 1);
      const box = (await homeButton(page).boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(48);
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThan(viewport.width / 2);
      expect(box.y + box.height).toBeLessThan(viewport.height / 2);
      // nothing else in the HUD overlaps it, and the whole HUD stays on screen
      const others = await hud(page).locator('.card, .hud-placed, button').evaluateAll((els) => els
        .filter((e) => !e.classList.contains('btn-home') && (e as HTMLElement).offsetParent !== null)
        .map((e) => { const r = e.getBoundingClientRect(); return { name: e.textContent ?? '', x: r.x, y: r.y, w: r.width, h: r.height }; }));
      expect(others.length).toBeGreaterThan(5);
      for (const o of others) {
        const apart = o.x >= box.x + box.width || o.x + o.w <= box.x || o.y >= box.y + box.height || o.y + o.h <= box.y;
        expect(apart, `${o.name} overlaps 🏠`).toBe(true);
        expect(o.x >= 0 && o.x + o.w <= viewport.width && o.y >= 0 && o.y + o.h <= viewport.height, `${o.name} off screen`).toBe(true);
      }
    });
  });
}
