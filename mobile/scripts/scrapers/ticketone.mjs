// TicketOne adapter (Playwright + stealth).
// ============================================================================
// The TicketOne city page is JS-rendered and behind Akamai bot protection (a
// plain fetch / bundled headless Chromium gets net::ERR_HTTP2_PROTOCOL_ERROR).
// Driven through stealth + real Chrome (see playwright.mjs) it loads fine. The
// page emits schema.org MusicEvent/LiteraryEvent JSON-LD nested in an ItemList,
// which the (deep-walking) JSON-LD extractor reads. A Next.js data-island parse
// is kept as a fallback. Verified live June 2026: ~18 events.

import { withPage } from './playwright.mjs';
import { extractEventsFromHtml } from './jsonld.mjs';
import { makeRow, dedupe } from './shared.mjs';

const DEFAULT_URL = 'https://www.ticketone.it/city/napoli-219/';

// Best-effort walk of __NEXT_DATA__ for event-like objects when JSON-LD is absent.
function looksLikeEvent(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
  const name = o.name || o.title || o.eventName;
  const date = o.startDate || o.date || o.eventDate || o.dateStart;
  return typeof name === 'string' && name.length > 1 && Boolean(date);
}

function collectFromNextData(json) {
  const out = [];
  const seen = new Set();
  const visit = (o) => {
    if (!o || typeof o !== 'object' || seen.has(o)) return;
    seen.add(o);
    if (Array.isArray(o)) return o.forEach(visit);
    if (looksLikeEvent(o)) out.push(o);
    for (const v of Object.values(o)) visit(v);
  };
  visit(json);
  return out;
}

export async function scrapeTicketone(url = DEFAULT_URL) {
  return withPage('ticketone', async (page) => {
    // 'networkidle' is unreliable on these sites (long-lived connections); wait
    // for the DOM, scroll to trigger lazy event tiles, then settle.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
    await page.waitForTimeout(3500);

    const html = await page.content();
    let rows = extractEventsFromHtml('ticketone', html);

    // Fallback: parse the Next.js data island if JSON-LD yielded nothing.
    if (rows.length === 0) {
      const nextData = await page
        .$eval('#__NEXT_DATA__', (el) => el.textContent)
        .catch(() => null);
      if (nextData) {
        try {
          const events = collectFromNextData(JSON.parse(nextData));
          rows = dedupe(events.map((e) =>
            makeRow({
              source: 'ticketone',
              title: e.name || e.title || e.eventName,
              description: e.description || e.subtitle || '',
              startISO: e.startDate || e.date || e.eventDate || e.dateStart,
              endISO: e.endDate || null,
              venue: e.location?.name || e.venue?.name || e.venueName,
              area: e.location?.address?.addressLocality || e.city,
              ticketUrl: e.url || e.ticketUrl || url,
              imageUrl: e.image?.url || e.image || e.imageUrl,
            })
          ));
        } catch { /* island wasn't JSON we understand */ }
      }
    }

    console.log(`· ticketone: ${rows.length} events`);
    return rows;
  });
}
