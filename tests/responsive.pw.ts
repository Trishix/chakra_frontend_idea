import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
]) {
  test(`${viewport.name} uses the app navigation without page overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    await expect(page.locator('.menu-toggle')).toBeHidden();
    await expect(page.locator('.sidebar nav')).toBeInViewport();
    const appNav = await page.locator('.sidebar').boundingBox();
    expect(appNav?.height).toBeLessThan(100);
    expect(Math.round((appNav?.y ?? 0) + (appNav?.height ?? 0))).toBe(viewport.height);
    await expect(page.locator('html')).toHaveJSProperty('scrollWidth', viewport.width);

    await page.getByRole('button', { name: 'Investigation', exact: true }).click();
    await expect(page.locator('.view-tabs button.active')).toHaveText('Graph');
    await expect(page.locator('.graph-stage')).toBeInViewport();
    await expect(page.getByLabel('Search investigation')).toBeHidden();
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await expect(page.getByLabel('Search investigation')).toBeVisible();
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    const graph = await page.locator('.graph-stage').boundingBox();
    const leads = await page.locator('.lead-panel').boundingBox();
    expect(graph!.y).toBeLessThan(leads!.y);
    await page.getByRole('button', { name: 'Evidence', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Evidence & review' })).toBeVisible();
    await page.getByRole('button', { name: 'Close drawer' }).click();
    await page.screenshot({ path: `/tmp/investigation-improved-${viewport.name}.png` });
    const graphHud = await page.locator('.graph-hud').boundingBox();
    expect(graphHud?.height).toBeLessThan(80);
    if (viewport.width < 600) {
      const node = await page.locator('.react-flow__node').first().boundingBox();
      expect(node?.width).toBeGreaterThanOrEqual(110);
    }
    await expect(page.locator('html')).toHaveJSProperty('scrollWidth', viewport.width);

    await page.getByRole('button', { name: 'Reports', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Investigation reports' })).toBeVisible();
    await expect(page.locator('html')).toHaveJSProperty('scrollWidth', viewport.width);
  });
}

test('desktop workbench fits after opening summary and filters', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Investigation', exact: true }).click();
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByRole('button', { name: 'Case summary', exact: true }).click();
  const workbench = await page.locator('.workbench').boundingBox();
  expect(workbench!.y + workbench!.height).toBeLessThanOrEqual(901);
  await expect(page.locator('.evidence-panel')).toBeVisible();
  await expect(page.locator('html')).toHaveJSProperty('scrollWidth', 1440);
  await page.screenshot({ path: '/tmp/investigation-improved-desktop.png' });
});
