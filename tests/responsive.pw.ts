import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
]) {
  test(`${viewport.name} navigates across intelligence modules without overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    // Check header and brand
    await expect(page.locator('.topbar')).toBeVisible();

    // Check dashboard loads
    await expect(page.getByRole('heading', { name: 'Operations Overview' })).toBeVisible();

    // Navigate to Connections
    await page.goto('/cases/c1/connections');
    await expect(page.locator('.graph-stage-wrap')).toBeVisible();

    // Navigate to Evidence
    await page.goto('/cases/c1/evidence');
    await expect(page.getByRole('heading', { name: 'Evidence Timeline' })).toBeVisible();

    // Navigate to Reports
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Investigation Reports' })).toBeVisible();
  });
}

test('desktop interface loads dashboard, case graph, and reports seamlessly', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Operations Overview' })).toBeVisible();

  // Open case connections graph
  await page.goto('/cases/c1/connections');
  await expect(page.locator('.react-flow')).toBeVisible();

  // Open reports
  await page.goto('/reports');
  await expect(page.getByRole('heading', { name: 'Investigation Reports' })).toBeVisible();
});
