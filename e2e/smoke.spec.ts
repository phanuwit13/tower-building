import { test as plain } from '@playwright/test';
import { expect, fromMore, setTime, test, tool } from './fixtures';
import { T } from '../src/ui/strings';
import { school } from '../src/themes/school';
import { amusement } from '../src/themes/amusement';
import { zoo } from '../src/themes/zoo';
import { beach } from '../src/themes/beach';
import { market } from '../src/themes/market';
import { cafe } from '../src/themes/cafe';
import { village } from '../src/themes/village';
import { park } from '../src/themes/park';
import { hospital } from '../src/themes/hospital';
import { space } from '../src/themes/space';
import { tokyo } from '../src/themes/tokyo';
import { FLOOR_TILES } from '../src/floors';
import { LEGACY_SAVE_KEY, SAVE_KEY } from '../src/game/save';

/** What is saved under the cities' keys (the v3 record and the legacy one-city save). */
const savedKeys = (page: import('@playwright/test').Page) =>
  page.evaluate((keys) => keys.map((k) => localStorage.getItem(k)), [SAVE_KEY, LEGACY_SAVE_KEY]);

const placed = (n: number) => `วางแล้ว ${n} ชิ้น`;

test('place survives reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(1))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(name).toBeTruthy();

  await page.reload();
  await expect(page.getByText(placed(1))).toBeVisible();
  await expect(page.getByTestId('current-name')).toHaveText(name!);
});

test('storage blocked still playable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('blocked', 'SecurityError'); };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(1))).toBeVisible();
  await expect(page.getByText(T.noticeSaveFailed)).toBeVisible();
});

test('clear returns to theme select', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await fromMore(page, T.clear);
  await page.getByRole('button', { name: T.confirmClearOk }).click();
  await expect(page.getByText(T.pickTheme)).toBeVisible();
  await expect(page.getByRole('button', { name: 'โรงเรียน' })).toBeVisible();
  expect(await savedKeys(page)).toEqual([null, null]);
});

test('keyboard shortcuts do nothing while a toolbar popover is open', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await page.keyboard.press('ArrowRight'); // ghost appears
  await tool(page, T.ground.title).click();
  await expect(page.locator('.tb-pop-ground')).toBeVisible();
  await page.keyboard.press('Enter');
  await page.keyboard.press(' ');
  await page.keyboard.press('Escape'); // closes the popover, and only that
  await expect(page.locator('.tb-pop-ground')).toBeHidden();
  await expect(page.getByText(placed(0))).toBeVisible();
});

// Plain test: aborting the bundle is expected to log a failed-request console error.
plain('fallback message shows when the app bundle never boots', async ({ page }) => {
  await page.route('**/assets/index-*.js', (r) => r.abort());
  await page.goto('/');
  await expect(page.getByText(T.noWebGL)).toBeVisible({ timeout: 8000 });
});

test('a slow download does not cover the game with the fallback message', async ({ page }) => {
  test.setTimeout(45_000);
  // A slow school network: the app bundle arrives after 6 s, well past the old fixed 4 s check.
  await page.route('**/assets/index-*.js', async (r) => {
    await new Promise((done) => setTimeout(done, 6000));
    await r.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  const school = page.getByRole('button', { name: 'โรงเรียน' });
  await expect(school).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(4000); // past the grace period after the page finished loading
  await expect(page.getByText(T.noWebGL)).toHaveCount(0);
  await school.click(); // nothing covers it
  await expect(page.getByText(placed(0))).toBeVisible();
});

test('booting removes a fallback message that is already showing', async ({ page }) => {
  // Stand-in for boot-check.js having already given up (e.g. an extremely slow load): the overlay
  // is on screen before the app runs. Booting must take it away.
  await page.route('**/boot-check.js', (r) => r.fulfill({
    contentType: 'text/javascript',
    body: `(function () {
      var p = document.createElement('p');
      p.id = 'boot-fallback';
      p.className = 'no-webgl';
      p.textContent = ${JSON.stringify(T.noWebGL)};
      document.body.appendChild(p);
    })();`,
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await expect(page.getByText(T.noWebGL)).toHaveCount(0);
  await expect(page.getByText(placed(0))).toBeVisible();
});

test('gallery shows every item of the theme with its Thai name, and no game', async ({ page }) => {
  test.setTimeout(60_000); // software WebGL draws every page of 50 items slowly: about 30 s, right at the default
  await page.goto('/?gallery=school');
  await expect(page.getByRole('heading', { name: /โรงเรียน/ })).toBeVisible();
  // every item exactly once, over as many pages as the theme needs
  const seen: string[] = [];
  for (;;) {
    await expect(page.locator('.gallery-label').first()).toBeVisible();
    seen.push(...await page.locator('.gallery-label strong').allTextContents());
    const next = page.getByRole('button', { name: 'หน้าถัดไป' });
    if (!(await next.isVisible()) || (await next.isDisabled())) break;
    await next.click();
  }
  expect(seen.sort()).toEqual(school.items.map((i) => i.name).sort());
  await expect(page.getByText(T.pickTheme)).toHaveCount(0);
  await expect(page.getByRole('button', { name: T.place })).toHaveCount(0);
  // lighting stays switchable; the game-only actions are not offered
  await setTime(page, T.time.night);
  await expect(tool(page, T.weather.rain)).toBeVisible();
  await expect(tool(page, T.ground.title)).toBeVisible();
  await expect(tool(page, /^คุณภาพภาพ/)).toBeVisible();
  for (const name of [T.toolbar.more, T.screenshot, T.toolbar.shortcuts]) await expect(tool(page, name)).toHaveCount(0);
  await expect(page.getByRole('button', { name: T.restart })).toHaveCount(0);
  await expect(page.getByRole('button', { name: T.clear })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0); // the gallery saves nothing
});

test('?gallery=floors shows every floor tile with its Thai name, and no game', async ({ page }) => {
  await page.goto('/?gallery=floors');
  await expect(page.locator('.gallery-label').first()).toBeVisible();
  // The gallery is paged (6 tiles a page): walk every page with ▶ and collect the names.
  const names: string[] = [];
  const next = page.locator('.gallery-next');
  for (;;) {
    names.push(...(await page.locator('.gallery-label strong').allTextContents()));
    if (await next.isDisabled()) break;
    const before = await page.locator('.gallery-page').textContent();
    await next.click();
    await expect(page.locator('.gallery-page')).not.toHaveText(before!);
  }
  expect(names.sort()).toEqual(FLOOR_TILES.map((t) => t.name).sort());
  await expect(page.getByRole('button', { name: T.place })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('gallery &item= shows one item with its label and budget, and unknown ids fall back', async ({ page }) => {
  await page.goto('/?gallery=school&item=classroom');
  const classroom = school.items.find((i) => i.id === 'classroom')!;
  await expect(page.locator('.gallery-label')).toHaveCount(1);
  await expect(page.locator('.gallery-label strong')).toHaveText(classroom.name);
  await expect(page.locator('.gallery-label')).toContainText('classroom');
  await expect(page.locator('.gallery-label .gallery-tris')).toHaveText(/^[\d,]+ \/ [\d,]+ tris$/);
  await expect(page.locator('.gallery-label')).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);

  await page.goto('/?gallery=school&item=nope');
  await expect(page.getByText('unknown item id: nope')).toBeVisible();
  await expect(page.locator('.gallery-label').first()).toBeVisible();
  expect(await page.locator('.gallery-label').count()).toBeGreaterThan(1);
});

test('?demo=full plays a full map in memory; on smooth it draws in a handful of calls', async ({ page }) => {
  test.setTimeout(60_000); // software WebGL draws a full map slowly
  await page.addInitScript(() => localStorage.setItem('city-builder/quality', 'smooth'));
  await page.goto('/?demo=full&fps=1');
  await expect(page.getByText(/^วางแล้ว \d+ ชิ้น$/)).toBeVisible();
  const overlay = page.locator('.fps-overlay');
  await expect(overlay).toHaveText(new RegExp(`^\\d+ fps · ${T.quality.smooth} · \\d+ calls · city \\d+\\.\\d ms$`), { timeout: 20_000 });
  // ~145 items used to cost ~350 calls a frame; merged, it is a few per map chunk plus ground, sky and ghost
  await expect.poll(async () => Number(/(\d+) calls/.exec((await overlay.textContent()) ?? '')?.[1]), { timeout: 20_000 })
    .toBeLessThanOrEqual(20);
  // the one free spot is the current item's: placing it fills the map and ends the round
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText(T.endTitle)).toBeVisible();
  await expect(page.getByText(/ใช้พื้นที่ 100%/)).toBeVisible();
  expect(await savedKeys(page)).toEqual([null, null]); // the player's own save is untouched
});

test('theme select offers สวนสนุก and its round starts with an amusement item', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'สวนสนุก' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(amusement.items.map((i) => i.name)).toContain(name);
});

test('theme select offers สวนสัตว์ and its round starts with a zoo item', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'สวนสัตว์' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(zoo.items.map((i) => i.name)).toContain(name);
});

test('theme select offers ชายหาดทะเล and its round starts with a beach item', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'ชายหาดทะเล' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(beach.items.map((i) => i.name)).toContain(name);
});

test('theme select offers ย่านการค้า and its round starts with a market item, lit with its night glow', async ({ page }) => {
  await page.goto('/');
  // the theme select (no game yet) is the standard night
  await expect(page.locator('#app')).toHaveAttribute('data-night-glow', '1');
  await page.getByRole('button', { name: 'ย่านการค้า' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(market.items.map((i) => i.name)).toContain(name);
  await expect(page.locator('#app')).toHaveAttribute('data-night-glow', '1.5'); // started round
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(1))).toBeVisible();
  await page.reload(); // the saved game
  await expect(page.getByText(placed(1))).toBeVisible();
  await expect(page.locator('#app')).toHaveAttribute('data-night-glow', '1.5');
  // clearing the city and starting another theme puts the standard night back
  await fromMore(page, T.clear);
  await page.getByRole('button', { name: T.confirmClearOk }).click();
  await expect(page.getByText(T.pickTheme)).toBeVisible();
  await page.getByRole('button', { name: 'ชายหาดทะเล' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  await expect(page.locator('#app')).toHaveAttribute('data-night-glow', '1');
});

test('the demo of ย่านการค้า is lit with its night glow; another theme\'s demo is not', async ({ page }) => {
  await page.goto('/?demo=full&theme=market');
  await expect(page.getByTestId('current-name')).toBeVisible();
  await expect(page.locator('#app')).toHaveAttribute('data-night-glow', '1.5');
  await page.goto('/?demo=full&theme=beach');
  await expect(page.getByTestId('current-name')).toBeVisible();
  await expect(page.locator('#app')).toHaveAttribute('data-night-glow', '1');
});

test('theme select offers ร้านคาเฟ่: its round starts indoors (in the café room) with a café item; another theme is outdoors, and the café city is kept', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#app')).toHaveAttribute('data-indoor', 'false'); // the theme select backdrop
  await expect(page.locator('#app')).toHaveAttribute('data-room', 'none');
  await page.getByRole('button', { name: 'ร้านคาเฟ่' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(cafe.items.map((i) => i.name)).toContain(name);
  await expect(page.locator('#app')).toHaveAttribute('data-indoor', 'true');
  await expect(page.locator('#app')).toHaveAttribute('data-room', 'cafe');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(1))).toBeVisible();
  // another theme: outdoors again
  await page.getByRole('button', { name: T.home }).click();
  await page.getByRole('button', { name: 'ชายหาดทะเล' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  await expect(page.locator('#app')).toHaveAttribute('data-indoor', 'false');
  await expect(page.locator('#app')).toHaveAttribute('data-room', 'none');
  // back to the café: its city, indoors
  await page.getByRole('button', { name: T.home }).click();
  await page.getByRole('button', { name: 'ร้านคาเฟ่' }).click();
  await expect(page.getByText(placed(1))).toBeVisible();
  await expect(page.locator('#app')).toHaveAttribute('data-indoor', 'true');
  await expect(page.locator('#app')).toHaveAttribute('data-room', 'cafe');
});

test('theme select offers หมู่บ้าน and its round starts with a village item, outdoors with the standard night', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'หมู่บ้าน' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(village.items.map((i) => i.name)).toContain(name);
  await expect(page.locator('#app')).toHaveAttribute('data-indoor', 'false');
  await expect(page.locator('#app')).toHaveAttribute('data-night-glow', '1');
});

test('theme select offers สวนสาธารณะ and its round starts with a park item, outdoors', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'สวนสาธารณะ' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(park.items.map((i) => i.name)).toContain(name);
  await expect(page.locator('#app')).toHaveAttribute('data-indoor', 'false');
});

test('theme select offers โรงพยาบาล: its round starts indoors in the hospital room with a hospital item', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'โรงพยาบาล' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(hospital.items.map((i) => i.name)).toContain(name);
  await expect(page.locator('#app')).toHaveAttribute('data-indoor', 'true');
  await expect(page.locator('#app')).toHaveAttribute('data-room', 'hospital');
  // the café keeps its own room
  await page.getByRole('button', { name: T.home }).click();
  await page.getByRole('button', { name: 'ร้านคาเฟ่' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-room', 'cafe');
});

test('theme select offers อวกาศ and its round starts with a space item on the moon ground, outdoors', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'อวกาศ' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(space.items.map((i) => i.name)).toContain(name);
  await expect(page.locator('#app')).toHaveAttribute('data-indoor', 'false');
});

test('theme select offers เมืองโตเกียว and its round starts with a Tokyo item, with the bright neon night', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'เมืองโตเกียว' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
  const name = await page.getByTestId('current-name').textContent();
  expect(tokyo.items.map((i) => i.name)).toContain(name);
  await expect(page.locator('#app')).toHaveAttribute('data-indoor', 'false');
  await expect(page.locator('#app')).toHaveAttribute('data-night-glow', '1.5');
});

test('a saved School city still loads with every theme registered', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(1))).toBeVisible();
  await page.reload();
  await expect(page.getByText(placed(1))).toBeVisible();
  await expect(page.getByText(T.pickTheme)).toBeHidden();
});
