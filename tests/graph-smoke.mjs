import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const click = name => page.getByRole('button', { name, exact: true }).click();
const count = async (nodes, edges) => {
  await page.waitForFunction(([n, e]) => document.querySelectorAll('[data-node-id]').length === n && document.querySelectorAll('[data-edge-id]').length === e, [nodes, edges]);
};
try {
  await page.goto(new URL('../index.html', import.meta.url).href);
  await page.getByRole('link', { name: /Case connections/ }).click();
  await count(9, 8);
  assert(!/Confidential|FIELD INTELLIGENCE|Audit Active/.test(await page.locator('header').innerText()));

  await click('1 link');
  await count(6, 5);
  await click('3 links');
  await count(10, 9);
  await click('Suggested');
  await count(7, 6);
  await click('Recorded');
  await count(1, 0);
  await click('Reset filters');
  await count(9, 8);
  await page.getByRole('button', { name: /^People \d/ }).click();
  await count(0, 0);
  await page.getByRole('heading', { name: 'No records to show' }).waitFor();
  await page.getByRole('button', { name: 'Reset filters', exact: true }).first().click();
  await count(9, 8);

  await page.locator('[data-node-id="vehicle"]').click();
  assert.match(await page.getByRole('complementary', { name: 'Record details' }).innerText(), /Maruti Swift/);
  await click('View source ANPR-001');
  assert.match(await page.getByRole('region', { name: 'Source record' }).innerText(), /18:22/);
  await click('Close source');
  await page.locator('[data-edge-id="r6"]').focus();
  await page.keyboard.press('Enter');
  assert.match(await page.getByRole('region', { name: 'Source record' }).innerText(), /shared identifier/);

  const search = page.getByPlaceholder('Name, case or phone');
  await search.fill('not-a-record');
  await page.getByText('No matching records.', { exact: true }).waitFor();
  await search.fill('Seized');
  await click('Seized handset');
  await count(10, 9);
  assert.equal(await page.locator('[data-node-id="device"]').getAttribute('aria-pressed'), 'true');

  const svg = page.locator('.original-network');
  const originalView = await svg.getAttribute('viewBox');
  await page.getByTitle('Zoom In', { exact: true }).click();
  assert.notEqual(await svg.getAttribute('viewBox'), originalView);
  await page.getByTitle('Fit to Screen', { exact: true }).click();
  assert.equal(await svg.getAttribute('viewBox'), originalView);
  const box = await svg.boundingBox();
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + 60, { steps: 5 });
  await page.mouse.up();
  assert.notEqual(await svg.getAttribute('viewBox'), originalView);
  await svg.focus();
  await page.keyboard.press('Home');
  assert.equal(await svg.getAttribute('viewBox'), originalView);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    click('Export'),
  ]);
  const data = JSON.parse(await readFile(await download.path(), 'utf8'));
  assert.equal(data.nodes.length, 10);
  assert.equal(data.connections.length, 9);
  assert.equal(data.mock, true);
  assert(data.connections.every(edge => data.nodes.some(n => n.id === edge.source) && data.nodes.some(n => n.id === edge.target)));

  await click('Reset filters');
  await count(9, 8);
  assert.equal(await page.getByRole('button', { name: '2 links', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.locator('.ci-action-toast.is-visible').waitFor({ state: 'detached' });
  await page.getByPlaceholder('Name, case or phone').focus();
  await page.evaluate(() => document.fonts.ready);
  await mkdir('.impeccable/review', { recursive: true });
  await page.screenshot({ path: '.impeccable/review/graph-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390, 'No mobile page overflow');
  await page.screenshot({ path: '.impeccable/review/graph-mobile.png', fullPage: true });
  assert.deepEqual(errors, [], 'No browser JavaScript errors');
  console.log('PASS: graph depth, types, edge filters, empty state, search, selection, sources, keyboard, pan, zoom, export, mobile width.');
} finally {
  await browser.close();
}
