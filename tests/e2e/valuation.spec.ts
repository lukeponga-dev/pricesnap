import { test, expect } from '@playwright/test';
import { image } from '../fixtures/provider';

async function upload(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Scan an item', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'headphones.png', mimeType: 'image/png', buffer: Buffer.from(image.split(',')[1], 'base64') });
}
test('upload, real pipeline progress, NZD result, save, reload, reopen and delete', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.setExtraHTTPHeaders({ 'x-test-scenario': 'slow' });
  await upload(page);
  await expect(page.getByRole('heading', { name: 'Valuing your item' })).toBeVisible();
  await expect(page.getByText('Estimated resale value')).toBeVisible();
  await expect.poll(() => page.locator('.pw-card').evaluateAll(cards => cards.every(card => { const panel = document.querySelector('.max-w-md')!.getBoundingClientRect(); const box = card.getBoundingClientRect(); return box.left >= panel.left + 15 && box.right <= panel.right - 15; }))).toBe(true);
  await page.screenshot({ path: 'test-results/valuation-' + page.viewportSize()?.width + '.png', fullPage: true });
  await expect(page.locator('p').filter({ hasText: /^\$260 NZD$/ })).toBeVisible();
  await expect(page.getByText('Search-supported comparables (3)')).toBeVisible();
  await page.getByRole('button', { name: 'Save Result' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Open dashboard' }).click();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await page.getByRole('button', { name: /Sony WH-1000XM4 headphones/ }).click();
  await expect(page.getByText('Estimated resale value')).toBeVisible();
  await page.getByRole('button', { name: 'Scan Again' }).click();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await page.getByRole('button', { name: 'Clear saved results' }).click();
  await expect(page.getByText('No scans saved yet')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('empty evidence never displays a zero dollar valuation', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-test-scenario': 'empty' }); await upload(page);
  await expect(page.getByRole('heading', { name: 'Not enough pricing evidence' })).toBeVisible();
  await expect(page.getByText('Estimated resale value')).not.toBeVisible();
  await expect(page.getByText('$0', { exact: true })).not.toBeVisible();
});
test('provider error stays visible and retry can recover without any mock fallback', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-test-scenario': 'error' }); await upload(page);
  await expect(page.getByRole('alert')).toContainText('The AI service is busy');
  await expect(page.getByText('Estimated resale value')).not.toBeVisible();
  await page.setExtraHTTPHeaders({}); await page.getByRole('button', { name: 'Retry scan', exact: true }).click();
  await expect(page.getByText('Estimated resale value')).toBeVisible();
});
test('cancel prevents a late response from replacing the scanner', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-test-scenario': 'slow' }); await upload(page);
  await page.getByRole('button', { name: 'Cancel scan' }).click();
  await expect(page.getByRole('button', { name: 'Upload Image', exact: true })).toBeVisible();
  await page.waitForTimeout(1800);
  await expect(page.getByText('Estimated resale value')).not.toBeVisible();
});
