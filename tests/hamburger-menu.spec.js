// @ts-check
const { test, expect } = require('@playwright/test');

test('Hamburger menu opens and closes on parking page (mobile)', async ({ page }) => {
  await page.goto('http://localhost:8080/parking.html');
  await page.setViewportSize({ width: 500, height: 800 });
  await page.waitForSelector('.menu-toggle');
  // Should be hidden initially (not open)
  const menuLinks = await page.$('#menuLinks');
  // Check for menu-links-open class
  expect(await menuLinks.evaluate(el => el.classList.contains('menu-links-open'))).toBeFalsy();
  await page.click('.menu-toggle');
  expect(await menuLinks.evaluate(el => el.classList.contains('menu-links-open'))).toBeTruthy();
  await page.click('.menu-toggle');
  expect(await menuLinks.evaluate(el => el.classList.contains('menu-links-open'))).toBeFalsy();
});
