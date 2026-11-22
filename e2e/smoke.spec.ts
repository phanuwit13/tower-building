import { expect, test } from '@playwright/test';
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
