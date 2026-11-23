import { expect, test as base, type Page } from '@playwright/test';
import { T } from '../src/ui/strings';

/**
 * Every test fails on an uncaught page error or a console error. Nothing is ignored: if a known
 * benign message ever has to be tolerated, list it here with the reason.
 */
const BENIGN: RegExp[] = [];

export const test = base.extend({
  page: async ({ page }, use) => {
    const problems: string[] = [];
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const text = m.text();
      if (!BENIGN.some((re) => re.test(text))) problems.push(`console.error: ${text}`);
    });
    await use(page);
    expect(problems, 'page errors / console errors').toEqual([]);
  },
});
export { expect };

/** The icon toolbar's buttons, by their Thai name. */
export const tool = (page: Page, name: string | RegExp) => page.locator('.toolbar').getByRole('button', { name });
/** ⋯ opened, then one of its items (เริ่มใหม่ / เคลียร์) clicked. */
export async function fromMore(page: Page, item: string): Promise<void> {
  await tool(page, T.toolbar.more).click();
  await page.locator('.tb-pop-more').getByRole('button', { name: item, exact: true }).click();
}
/** The time button, clicked until the scene is at `time` (dawn → day → dusk → night → dawn). */
export async function setTime(page: Page, time: string): Promise<void> {
  const btn = tool(page, /^ช่วงเวลา/);
  for (let i = 0; i < 4 && (await btn.getAttribute('aria-label')) !== `${T.time.title}: ${time}`; i++) await btn.click();
  await expect(btn).toHaveAttribute('aria-label', `${T.time.title}: ${time}`);
}
