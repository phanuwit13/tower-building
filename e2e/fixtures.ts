import { expect, test as base } from '@playwright/test';

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
