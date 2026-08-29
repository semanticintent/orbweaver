import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { build } from 'esbuild'

let browserBundle = ''

test.beforeAll(async () => {
  const result = await build({
    entryPoints: ['tests/browser/browser-entry.ts'],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2022'],
    write: false,
  })
  browserBundle = result.outputFiles[0]?.text ?? ''
})

async function mountFixture(page: Page): Promise<void> {
  await page.setContent(`<!doctype html>
    <html lang="en">
      <head><meta charset="utf-8"><title>Orbweaver browser quality fixture</title></head>
      <body><main><h1>Semantic diagram</h1><div id="diagram"></div></main></body>
    </html>`)
  await page.addScriptTag({ content: browserBundle })
  await page.evaluate(async () => {
    const api = (globalThis as typeof globalThis & {
      orbweaverBrowserTest: { mount(): Promise<void> }
    }).orbweaverBrowserTest
    await api.mount()
  })
}

test('selects nodes and relationships with visible connected context', async ({ page }) => {
  await mountFixture(page)
  const request = page.locator('[data-node-id="request"]')
  await request.click()
  await expect(request).toHaveAttribute('data-selected', '')
  await expect(page.locator('[data-node-id="validate"]')).toHaveAttribute('data-related', '')
  await expect(page.locator('[data-node-id="artifact"]')).toHaveAttribute('data-muted', '')

  await page.locator('[data-edge-id="rendering"] .ow-edge-hit').click({ force: true })
  await expect(page.locator('[data-edge-id="rendering"]')).toHaveAttribute('data-selected', '')
  await expect(page.locator('[data-node-id="validate"]')).toHaveAttribute('data-related', '')
  await expect(page.locator('[data-node-id="artifact"]')).toHaveAttribute('data-related', '')
})

test('supports keyboard selection, clearing, zoom, and fit', async ({ page }) => {
  await mountFixture(page)
  const node = page.locator('[data-node-id="validate"]')
  await node.focus()
  await node.press('Enter')
  await expect(node).toHaveAttribute('data-selected', '')
  await node.press('Escape')
  await expect(node).not.toHaveAttribute('data-selected', '')

  const svg = page.locator('svg')
  await svg.focus()
  await svg.press('+')
  await expect(svg).toHaveAttribute('data-ow-viewport-active', '')
  await svg.press('0')
  await expect(svg).not.toHaveAttribute('data-ow-viewport-active', '')
})

test('has no automatically detectable accessibility violations', async ({ page }) => {
  await mountFixture(page)
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('remains usable in a narrow responsive container and print media', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mountFixture(page)
  await page.locator('#diagram').evaluate((element) => {
    element.style.width = '340px'
    element.style.overflow = 'auto'
  })
  const svg = page.locator('svg')
  await expect(svg).toBeVisible()
  await expect(svg).toHaveAttribute('width', '100%')
  expect((await svg.boundingBox())?.width).toBeLessThanOrEqual(340)
  await expect(page.locator('[data-node-id="request"]')).toBeVisible()

  await page.emulateMedia({ media: 'print' })
  await expect(svg).toBeVisible()
  const viewBox = await svg.getAttribute('viewBox')
  expect(viewBox).toMatch(/^0 0 \d+(?:\.\d+)? \d+(?:\.\d+)?$/)
})
