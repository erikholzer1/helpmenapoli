// Shared Playwright loader for the JS-rendered sources (TicketOne, Dice).
// ============================================================================
// These sites sit behind bot protection (TicketOne=Akamai, Dice=Cloudflare).
// Plain headless Chromium is blocked, so we drive Playwright through
// `playwright-extra` + the stealth plugin AND prefer the real Google Chrome
// channel (its genuine TLS/HTTP2 fingerprint is what gets past Akamai). This
// combination was verified to load both sites unchallenged (June 2026).
//
// Everything is OPTIONAL/graceful: if playwright-extra, Playwright, or a browser
// isn't installed, the adapters log a skip and return [] instead of crashing —
// the API + JSON-LD sources keep working.
//
// Enable locally:  npx playwright install chrome     (real Chrome — best)
//          or:     npx playwright install chromium   (bundled — stealth only)

let _chromium;

// Returns a stealth-enabled chromium, falling back to plain Playwright, or null.
export async function getChromium() {
  if (_chromium !== undefined) return _chromium;
  try {
    const { chromium } = await import('playwright-extra');
    const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
    chromium.use(StealthPlugin());
    _chromium = chromium;
  } catch {
    try {
      _chromium = (await import('playwright')).chromium;
    } catch {
      _chromium = null;
    }
  }
  return _chromium;
}

// Launch real Chrome if available (best at evading Akamai/Cloudflare), else the
// bundled Chromium. Both with the trivial automation flag disabled.
async function launchBrowser(chromium) {
  const args = ['--disable-blink-features=AutomationControlled'];
  try {
    return await chromium.launch({ headless: true, channel: 'chrome', args });
  } catch {
    return await chromium.launch({ headless: true, args });
  }
}

// Runs `fn(page)` in a fresh stealth context, always closing the browser.
// A realistic locale/timezone/viewport helps managed challenges auto-pass.
export async function withPage(source, fn) {
  const chromium = await getChromium();
  if (!chromium) {
    console.log(`· ${source}: skipped (Playwright not installed — run: npx playwright install chrome)`);
    return [];
  }
  let browser;
  try {
    browser = await launchBrowser(chromium);
    const context = await browser.newContext({
      locale: 'it-IT',
      timezoneId: 'Europe/Rome',
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    return await fn(page);
  } catch (err) {
    // Playwright errors carry a multi-line "Call log"; keep just the first line.
    console.warn(`· ${source} FAILED: ${String(err.message).split('\n')[0]}`);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}
