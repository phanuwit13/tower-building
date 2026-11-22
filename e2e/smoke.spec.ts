import { test as plain } from '@playwright/test';
import { expect, test } from './fixtures';
import { T } from '../src/ui/strings';

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
  await page.getByRole('button', { name: T.settings }).click();
  await page.getByRole('button', { name: T.clear }).click();
  await page.getByRole('button', { name: T.confirmClearOk }).click();
  await expect(page.getByText(T.pickTheme)).toBeVisible();
  await expect(page.getByRole('button', { name: 'โรงเรียน' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('city-builder/save'))).toBeNull();
});

test('keyboard shortcuts do nothing while settings are open', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'โรงเรียน' }).click();
  await page.keyboard.press('ArrowRight'); // ghost appears
  await page.getByRole('button', { name: T.settings }).click();
  await page.keyboard.press('Enter');
  await page.keyboard.press(' ');
  await page.keyboard.press('Escape');
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
