import type { Page } from '@playwright/test';
import { expect, fromMore, setTime, test, tool } from './fixtures';
import { upcoming } from '../src/app/controller';
import { QUALITY_KEY, SAVE_KEY } from '../src/game/save';
import type { GameState } from '../src/game/types';
import { getTheme } from '../src/themes/registry';
import { T } from '../src/ui/strings';

test.describe.configure({ timeout: 60_000 });

const placed = (n: number) => `วางแล้ว ${n} ชิ้น`;
const schoolCity = (page: Page) =>
  page.evaluate((k) => (JSON.parse(localStorage.getItem(k)!) as { cities: { school: GameState } }).cities.school, SAVE_KEY);
const nameOf = (id: string) => getTheme('school')!.items.find((i) => i.id === id)!.name;
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const distance = async (page: Page) => Number(await page.locator('.cam-controls').getAttribute('data-distance'));
/** The camera distance once a zoom glide has settled: two reads 200 ms apart agree (a slow runner draws the glide in few frames). */
async function settledDistance(page: Page): Promise<number> {
  let last = await distance(page);
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(200);
    const d = await distance(page);
    if (Math.abs(d - last) < 0.005) return d;
    last = d;
  }
  return last;
}

async function startSchool(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await expect(page.getByText(placed(0))).toBeVisible();
}

test('the toolbar: time cycles, rain toggles, ground swatches, quality toggles; each saves', async ({ page }) => {
  await startSchool(page);
  const time = tool(page, /^ช่วงเวลา/);
  await expect(time).toHaveAttribute('aria-label', `${T.time.title}: ${T.time.day}`);
  const seen: string[] = [];
  for (let i = 0; i < 4; i++) {
    await time.click();
    seen.push((await time.getAttribute('aria-label'))!);
  }
  expect(seen).toEqual([T.time.dusk, T.time.night, T.time.dawn, T.time.day].map((t) => `${T.time.title}: ${t}`));
  await setTime(page, T.time.night);
  expect((await schoolCity(page)).settings.time).toBe('night');

  const rain = tool(page, T.weather.rain);
  await rain.click();
  await expect(rain).toHaveAttribute('aria-pressed', 'true');
  expect((await schoolCity(page)).settings.weather).toBe('rain');
  await rain.click();
  await expect(rain).toHaveAttribute('aria-pressed', 'false');
  expect((await schoolCity(page)).settings.weather).toBe('sunny');

  await tool(page, T.ground.title).click();
  const pop = page.locator('.tb-pop-ground');
  await expect(pop).toBeVisible();
  await expect(pop.getByText(T.ground.title, { exact: true })).toBeVisible();
  await pop.getByRole('button', { name: T.ground.sand }).click();
  expect((await schoolCity(page)).settings.ground).toBe('sand');
  await expect(pop.getByRole('button', { name: T.ground.sand })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(pop).toBeHidden();
  // an outside tap closes it too
  await tool(page, T.ground.title).click();
  await expect(pop).toBeVisible();
  const { width, height } = page.viewportSize()!;
  await page.mouse.click(width * 0.3, height * 0.5);
  await expect(pop).toBeHidden();
  await expect(page.getByText(placed(0))).toBeVisible(); // that tap only closed the popover: no ghost, nothing placed
  await expect(page.getByText(T.hintTap)).toBeVisible(); // no ghost appeared
  await expect(button(page, T.place)).toBeDisabled();

  // Quality: start on ลื่น so the automatic drop to ลื่น (a slow machine) cannot race the click
  await page.evaluate((k) => localStorage.setItem(k, 'smooth'), QUALITY_KEY);
  await page.reload();
  await expect(page.getByText(placed(0))).toBeVisible();
  const quality = tool(page, /^คุณภาพภาพ/);
  await expect(quality).toHaveAttribute('aria-label', `${T.quality.title}: ${T.quality.smooth}`);
  await quality.click();
  await expect(quality).toHaveAttribute('aria-label', `${T.quality.title}: ${T.quality.pretty}`);
  expect(await page.evaluate((k) => localStorage.getItem(k), QUALITY_KEY)).toBe('pretty');
  await quality.click();
  await expect(quality).toHaveAttribute('aria-label', `${T.quality.title}: ${T.quality.smooth}`);
  expect(await page.evaluate((k) => localStorage.getItem(k), QUALITY_KEY)).toBe('smooth');
});

test('📷 saves a picture and says so', async ({ page }) => {
  await startSchool(page);
  const download = page.waitForEvent('download').catch(() => null);
  await tool(page, T.screenshot).click();
  await expect(page.getByText(T.noticeShotSaved)).toBeVisible({ timeout: 20_000 });
  expect(await download).not.toBeNull();
});

test('⋯ restart and clear both ask first: Cancel keeps the city, OK acts', async ({ page }) => {
  await startSchool(page);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(1))).toBeVisible();

  await fromMore(page, T.restart);
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(T.confirmRestart)).toBeVisible();
  await expect(page.locator('.tb-pop-more')).toBeHidden(); // the menu stepped aside
  await dialog.getByRole('button', { name: T.cancel }).click();
  await expect(page.getByText(placed(1))).toBeVisible();
  await fromMore(page, T.restart);
  await page.getByRole('dialog').getByRole('button', { name: T.confirmRestartOk }).click();
  await expect(page.getByText(placed(0))).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await fromMore(page, T.clear);
  await expect(page.getByRole('dialog').getByText(T.confirmClear)).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: T.cancel }).click();
  await expect(page.getByText(placed(1))).toBeVisible();
  await fromMore(page, T.clear);
  await page.getByRole('dialog').getByRole('button', { name: T.confirmClearOk }).click();
  await expect(page.getByText(T.pickTheme)).toBeVisible();
});

test('the shortcuts list stays on the right while playing; its header, ⌨️ and ? fold it; the game keys work beside it; the choice is remembered', async ({ page }) => {
  await startSchool(page);
  const panel = page.getByRole('complementary', { name: T.shortcuts.title });
  const list = panel.locator('.sc-list');
  const head = panel.getByRole('button', { name: T.shortcuts.title });
  await expect(list).toBeVisible();
  await expect(head).toHaveAttribute('aria-expanded', 'true');
  for (const key of ['Enter', 'Space', 'R', 'Q', 'E', 'Esc', '?']) await expect(panel.locator('kbd', { hasText: new RegExp(`^${key.replace('?', '\\?')}$`) })).toBeVisible();
  for (const does of ['วาง', 'หมุนของ', 'เลื่อน', 'หมุนกล้อง', 'ซูม']) await expect(panel.getByText(does, { exact: true })).toBeVisible();
  // it never takes the keyboard: the game's keys go straight past it, Esc included
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(1))).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(list).toBeVisible();

  await head.click();
  await expect(list).toBeHidden();
  await expect(head).toBeVisible(); // folded down to its header
  await expect(head).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true); // Space still reaches the game
  await page.keyboard.press('?');
  await expect(list).toBeVisible();
  await tool(page, T.toolbar.shortcuts).click();
  await expect(list).toBeHidden();

  await page.reload();
  await expect(page.getByText(placed(1))).toBeVisible();
  await expect(head).toBeVisible();
  await expect(list).toBeHidden(); // still folded on the next visit
  await page.keyboard.press('?');
  await expect(list).toBeVisible();

  await page.getByRole('button', { name: T.home }).click();
  await expect(page.getByText(T.pickTheme)).toBeVisible();
  await expect(panel).toBeHidden(); // not on theme select
});

test('a mouse-opened popover closed with Esc, or ⌨️ clicked, leaves Space free to place; a destructive confirm starts on ยกเลิก', async ({ page }) => {
  await startSchool(page);
  await page.keyboard.press('ArrowRight'); // a ghost
  const focusIsPage = () => page.evaluate(() => document.activeElement === document.body);
  await tool(page, T.ground.title).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.tb-pop-ground')).toBeHidden();
  expect(await focusIsPage()).toBe(true);
  await tool(page, T.toolbar.shortcuts).click();
  await expect(page.locator('.sc-list')).toBeHidden();
  expect(await focusIsPage()).toBe(true);
  await page.keyboard.press(' ');
  await expect(page.getByText(placed(1))).toBeVisible();

  // a keyboard-opened popover still returns to its button
  await tool(page, T.ground.title).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await expect(tool(page, T.ground.title)).toBeFocused();

  // the confirm: ยกเลิก has the focus, Space cancels and the city stays
  await fromMore(page, T.clear);
  await expect(page.getByRole('dialog').getByRole('button', { name: T.cancel })).toBeFocused();
  await page.keyboard.press(' ');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText(placed(1))).toBeVisible();
});

test('the next four items follow the bag, and move up after each placing', async ({ page }) => {
  await startSchool(page);
  const shown = () => page.locator('.card-mini .card-name').allTextContents();
  const expected = async () => upcoming(await schoolCity(page)).map(nameOf);
  const before = await expected();
  expect(before).toHaveLength(4);
  expect(await shown()).toEqual(before);
  await expect(page.getByText(T.next, { exact: true })).toHaveCount(1);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(1))).toBeVisible();
  const after = await expected();
  expect(after.slice(0, 3)).toEqual(before.slice(1)); // what was second is first now
  expect(await shown()).toEqual(after);
  await expect(page.getByTestId('current-name')).toHaveText(before[0]);
});

test('ปูกระเบื้อง opens the floor drawer, and the whole-map ground icon has its own name', async ({ page }) => {
  await startSchool(page);
  const floors = page.locator('.hud').getByRole('button', { name: 'ปูกระเบื้อง', exact: true });
  await expect(floors).toBeVisible();
  await expect(floors.locator('svg')).toBeVisible();
  await expect(tool(page, 'สีพื้นทั้งแผนที่')).toBeVisible();
  await floors.click();
  await expect(page.getByRole('region', { name: T.floor.title })).toBeVisible();
  await expect(tool(page, T.ground.title)).toBeVisible(); // the toolbar stays
});

test('after a mouse click on any button the next key reaches the game (Space places, never re-presses the button)', async ({ page }) => {
  await startSchool(page);
  await page.keyboard.press('ArrowRight'); // a ghost
  const d0 = await distance(page);
  await button(page, T.camera.zoomIn).click();
  await expect.poll(() => distance(page)).toBeLessThan(d0 - 1);
  const d1 = await settledDistance(page); // the end of the zoom step, not a frame in the middle of its glide
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await page.keyboard.press(' ');
  await expect(page.getByText(placed(1))).toBeVisible();
  await page.waitForTimeout(400);
  expect(await distance(page)).toBeCloseTo(d1, 1); // Space did not zoom again

  // a toolbar button, the camera turn buttons, the slider: same
  await page.keyboard.press('ArrowRight');
  await tool(page, T.weather.rain).click();
  await button(page, T.camera.turnRight).click();
  await page.locator('.cam-slider').click();
  await page.keyboard.press('Enter');
  await expect(page.getByText(placed(2))).toBeVisible();
  await expect(tool(page, T.weather.rain)).toHaveAttribute('aria-pressed', 'true'); // not toggled back
  await tool(page, T.ground.title).click();
  await page.keyboard.press('Escape'); // a popover opened by mouse closes by Esc
  await expect(page.locator('.tb-pop-ground')).toBeHidden();
  // ปูกระเบื้อง then เสร็จ by mouse: Space must not open the drawer again
  await page.locator('.hud').getByRole('button', { name: T.floor.open, exact: true }).click();
  await page.getByRole('button', { name: T.floor.done }).click();
  await page.keyboard.press(' ');
  await expect(page.getByRole('region', { name: T.floor.title })).toBeHidden();
});

test('keyboard users still activate a focused button with Enter and Space', async ({ page }) => {
  await startSchool(page);
  const rain = tool(page, T.weather.rain);
  await rain.focus();
  await page.keyboard.press('Enter');
  await expect(rain).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press(' ');
  await expect(rain).toHaveAttribute('aria-pressed', 'false');
  await tool(page, T.ground.title).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.tb-pop-ground')).toBeVisible();
  await expect(page.locator('.tb-pop-ground button').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(tool(page, T.ground.title)).toBeFocused(); // back where they were
});

// The toolbar and the shortcuts list around the camera controls and the HUD: a laptop, a short laptop window (the list moves left of the camera controls), an iPad (landscape), a tablet held upright.
const OUT = '.superpowers/sdd/2026-11-24-hud-controls/shots/task2';
for (const viewport of [{ width: 1280, height: 720 }, { width: 1366, height: 657 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }]) {
  test.describe(`${viewport.width} x ${viewport.height}`, () => {
    test.use({ viewport });

    test('every toolbar button is 48 px or more, on screen, and overlaps neither the HUD nor the camera controls', async ({ page }) => {
      await startSchool(page);
      const rects = (sel: string) => page.locator(sel).evaluateAll((els) => els
        .filter((e) => !e.closest('[hidden]'))
        .map((e) => { const r = e.getBoundingClientRect(); return { name: e.getAttribute('aria-label') ?? e.textContent ?? e.className, x: r.x, y: r.y, w: r.width, h: r.height }; }));
      const bar = await rects('.toolbar .tb-btn');
      expect(bar).toHaveLength(7);
      const others = await rects('.hud .card:not(.card-next), .hud .card-mini, .hud .hud-placed, .hud .hud-hint, .hud button, .cam-controls button, .cam-slider-box');
      expect(others.length).toBeGreaterThan(8);
      const minis = await page.locator('.card-mini').evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== 'none').length);
      expect(minis).toBeGreaterThanOrEqual(viewport.width <= 560 ? 2 : 4);
      for (const b of bar) {
        expect(b.x >= 0 && b.y >= 0 && b.x + b.w <= viewport.width && b.y + b.h <= viewport.height, `${b.name} off screen`).toBe(true);
        expect(b.w, b.name).toBeGreaterThanOrEqual(48);
        expect(b.h, b.name).toBeGreaterThanOrEqual(48);
        for (const o of others) {
          const apart = b.x >= o.x + o.w || b.x + b.w <= o.x || b.y >= o.y + o.h || b.y + b.h <= o.y;
          expect(apart, `${b.name} overlaps ${o.name}`).toBe(true);
        }
      }
      if (viewport.width === 768) { // held upright: one column on the right
        expect(new Set(bar.map((b) => Math.round(b.x))).size).toBe(1);
        expect(bar[0].x).toBeGreaterThan(viewport.width / 2);
      }
    });

    test('the shortcuts list, open or folded, is on screen and overlaps neither the toolbar, the HUD nor the camera controls', async ({ page }) => {
      await startSchool(page);
      const rects = (sel: string) => page.locator(sel).evaluateAll((els) => els
        .filter((e) => !e.closest('[hidden]'))
        .map((e) => { const r = e.getBoundingClientRect(); return { name: e.getAttribute('aria-label') ?? e.textContent ?? e.className, x: r.x, y: r.y, w: r.width, h: r.height }; }));
      for (const state of ['open', 'folded']) {
        const [p] = await rects('.shortcuts');
        expect(p, state).toBeDefined();
        expect(p.x >= 0 && p.y >= 0 && p.x + p.w <= viewport.width && p.y + p.h <= viewport.height, `${state}: off screen`).toBe(true);
        const others = await rects('.toolbar .tb-btn, .hud .card:not(.card-next), .hud .card-mini, .hud .hud-placed, .hud .hud-hint, .hud button, .cam-controls button, .cam-slider-box');
        expect(others.length).toBeGreaterThan(15);
        for (const o of others) {
          const apart = p.x >= o.x + o.w || p.x + p.w <= o.x || p.y >= o.y + o.h || p.y + p.h <= o.y;
          expect(apart, `${state}: the shortcuts list overlaps ${o.name}`).toBe(true);
        }
        await page.locator('.sc-head').click();
      }
    });

    test('the ground popover fits on screen; screenshots of the HUD with the shortcuts list, the popover and the folded list', async ({ page }) => {
      await startSchool(page);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}/${viewport.width}x${viewport.height}-hud.png` });
      await tool(page, T.ground.title).click();
      const pop = page.locator('.tb-pop-ground');
      await expect(pop).toBeVisible();
      const box = (await pop.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      await page.screenshot({ path: `${OUT}/${viewport.width}x${viewport.height}-popover.png` });
      await page.keyboard.press('Escape');
      await page.keyboard.press('?');
      await expect(page.locator('.sc-list')).toBeHidden();
      await page.screenshot({ path: `${OUT}/${viewport.width}x${viewport.height}-shortcuts-folded.png` });
    });
  });
}
