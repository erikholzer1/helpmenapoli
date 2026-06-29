// Dice.fm adapter (Playwright + stealth).
// ============================================================================
// Dice has no public API. The browse page is a Next.js app that ships its full
// event list in the embedded #__NEXT_DATA__ island at props.pageProps.events[].
// We render the page (stealth + real Chrome gets past Cloudflare — see
// playwright.mjs), read that island, and map the events. This is far more
// stable than intercepting api.dice.fm (which the page barely uses).
//
// Verified live June 2026: ~30 events. If Dice changes its data shape the field
// reads below are defensive (fallbacks per field) so it degrades, not crashes.

import { withPage } from './playwright.mjs';
import { makeRow, dedupe } from './shared.mjs';

const DEFAULT_URL = 'https://dice.fm/browse/napoli-5ecd233473f34c16102db9ff';

function mapDiceEvent(e) {
  const venue = Array.isArray(e.venues) ? e.venues[0] : (e.venue || null);
  const dates = e.dates || {};

  // Prices are minor units (cents): price.amount (fixed) or amount_from (lowest).
  let priceText = null;
  let isFree = false;
  const cents = e.price?.amount ?? e.price?.amount_from ?? null;
  if (cents === 0) isFree = true;
  else if (typeof cents === 'number') {
    priceText = (e.price?.amount == null && e.price?.amount_from != null)
      ? `from €${Math.round(cents / 100)}`
      : `€${Math.round(cents / 100)}`;
  }

  const ticketUrl =
    e.social_links?.event_share ||
    (e.perm_name ? `https://dice.fm/event/${e.perm_name}` : DEFAULT_URL);

  return makeRow({
    source: 'dice',
    title: e.name,
    description: e.about?.description || e.summary || '',
    startISO: dates.event_start_date || (e.date_unix ? new Date(e.date_unix * 1000).toISOString() : null),
    endISO: dates.event_end_date || null,
    venue: venue?.name,
    area: venue?.city?.name || null,
    priceText,
    isFree,
    ticketUrl,
    imageUrl: e.images?.landscape || e.images?.square || null,
    // Dice is overwhelmingly gigs/club nights; default to music but let explicit
    // theater/comedy keywords in the title win via categorize().
    types: ['MusicEvent'],
  });
}

export async function scrapeDice(url = DEFAULT_URL) {
  return withPage('dice', async (page) => {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000); // let Cloudflare's managed challenge settle

    const nextData = await page.$eval('#__NEXT_DATA__', (el) => el.textContent).catch(() => null);
    if (!nextData) {
      console.log('· dice: 0 events (no __NEXT_DATA__ — page may have been challenged)');
      return [];
    }

    let events = [];
    try {
      events = JSON.parse(nextData)?.props?.pageProps?.events ?? [];
    } catch { /* malformed island */ }

    const rows = dedupe(events.map(mapDiceEvent));
    console.log(`· dice: ${rows.length} events (from ${events.length} in __NEXT_DATA__)`);
    return rows;
  });
}
