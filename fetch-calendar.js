#!/usr/bin/env node

// Fetch and combine events from Google Calendar (iCal), Tockify (JSON API),
// Indivisible Lab (Google iCal feed), and Mobilize.us (public JSON API).
// Usage: node fetch-calendar.js [--json] [--csv] [--days N]
//
// Sources:
//   1. Google Calendar (turnpurple2blue) - iCal feed, no credentials needed
//   2. Tockify (Lexington Alarm) - public JSON API, no credentials needed
//   3. Indivisible Lab - Google Calendar iCal feed, no credentials needed
//   4-7. Mobilize.us - public JSON API, 4 queries, no credentials needed

const https = require('https');
const url = require('url');

// --- Configuration ---
const GOOGLE_ICAL_URL =
  'https://calendar.google.com/calendar/ical/kksmh53lsoas0nklqsj92rq2s3h499f6%40import.calendar.google.com/public/basic.ics';

const TOCKIFY_API_URL = 'https://tockify.com/api/ngevent';
const TOCKIFY_CALNAME = 'lexingtonalarm';

const INDIVISIBLE_ICAL_URL =
  'https://calendar.google.com/calendar/ical/indivisiblelab%40gmail.com/public/basic.ics';

const MOBILIZE_API_URL = 'https://api.mobilize.us/v1/events';
const MOBILIZE_QUERIES = [
  {
    label: 'virtual election events',
    params: { is_virtual: 'true', tag_ids: ['34', '134', '73'] },
  },
  {
    label: 'ICE virtual events',
    params: { is_virtual: 'true', q: 'ICE' },
  },
  {
    label: 'ICE near Burlington',
    params: { zipcode: '01803', max_dist: '50', q: 'ICE' },
  },
  {
    label: 'election near Burlington',
    params: { zipcode: '01803', max_dist: '50', tag_ids: ['134', '170', '1097', '34'] },
  },
];

// Towns to keep (case-insensitive). Events with blank location are also kept.
const ALLOWED_TOWNS = [
  'bedford', 'burlington', 'billerica', 'lexington',
  'arlington', 'woburn', 'concord', 'carlisle',
];

// --- Helpers ---

function httpGet(reqUrl) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(reqUrl);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'fixice-calendar-fetcher/1.0' },
    };
    https.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// --- iCal Parser (minimal, handles VEVENT blocks) ---

function parseIcal(icalText) {
  const events = [];
  // Unfold continuation lines (lines starting with space/tab are continuations)
  const unfolded = icalText.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);

  let inEvent = false;
  let ev = {};

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      ev = {};
    } else if (line === 'END:VEVENT') {
      inEvent = false;
      events.push(ev);
    } else if (inEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      let key = line.substring(0, colonIdx);
      const value = line.substring(colonIdx + 1);
      // Strip parameters (e.g., DTSTART;VALUE=DATE: )
      const semiIdx = key.indexOf(';');
      if (semiIdx !== -1) key = key.substring(0, semiIdx);
      ev[key] = value;
    }
  }
  return events;
}

function parseIcalDate(dtStr) {
  // Format: 20260227T093000Z or 20260227
  if (!dtStr) return null;
  const y = parseInt(dtStr.substring(0, 4));
  const m = parseInt(dtStr.substring(4, 6)) - 1;
  const d = parseInt(dtStr.substring(6, 8));
  if (dtStr.length >= 15) {
    const hh = parseInt(dtStr.substring(9, 11));
    const mm = parseInt(dtStr.substring(11, 13));
    const ss = parseInt(dtStr.substring(13, 15));
    if (dtStr.endsWith('Z')) {
      return new Date(Date.UTC(y, m, d, hh, mm, ss));
    }
    return new Date(y, m, d, hh, mm, ss);
  }
  return new Date(y, m, d);
}

function unescapeIcal(str) {
  if (!str) return '';
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

// --- Fetch Google Calendar events ---

async function fetchGoogleCalendar(daysAhead) {
  const icalText = await httpGet(GOOGLE_ICAL_URL);
  const rawEvents = parseIcal(icalText);
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 86400000);

  return rawEvents
    .map((ev) => {
      const start = parseIcalDate(ev.DTSTART);
      const end = parseIcalDate(ev.DTEND);
      if (!start) return null;
      return {
        source: 'turnpurple2blue',
        title: unescapeIcal(ev.SUMMARY) || '(no title)',
        description: unescapeIcal(ev.DESCRIPTION) || '',
        start,
        end,
        location: unescapeIcal(ev.LOCATION) || '',
        link: ev.URL || '',
      };
    })
    .filter((ev) => ev && ev.start >= now && ev.start <= cutoff);
}

// --- Fetch Tockify events ---

async function fetchTockify(daysAhead) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 86400000);
  const apiUrl = `${TOCKIFY_API_URL}?calname=${TOCKIFY_CALNAME}&startms=${now.getTime()}&endms=${cutoff.getTime()}&max=50`;

  const json = await httpGet(apiUrl);
  const data = JSON.parse(json);

  if (!data.events) return [];

  return data.events.map((ev) => {
    const start = ev.when?.start?.millis ? new Date(ev.when.start.millis) : null;
    const end = ev.when?.end?.millis ? new Date(ev.when.end.millis) : null;
    const content = ev.content || {};
    const loc = content.location;

    let locationStr = '';
    if (content.place) locationStr = content.place;
    if (content.address) locationStr += (locationStr ? ', ' : '') + content.address;

    return {
      source: 'Lexington Alarm',
      title: content.summary?.text || '(no title)',
      description: content.description?.text || '',
      start,
      end,
      location: locationStr,
      link: `https://tockify.com/lexingtonalarm/detail/${ev.eid?.uid}/${ev.eid?.tid}`,
    };
  });
}

// --- Fetch Indivisible Lab events (Google Calendar iCal) ---

async function fetchIndivisibleLab(daysAhead) {
  const icalText = await httpGet(INDIVISIBLE_ICAL_URL);
  const rawEvents = parseIcal(icalText);
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 86400000);

  return rawEvents
    .map((ev) => {
      const start = parseIcalDate(ev.DTSTART);
      const end = parseIcalDate(ev.DTEND);
      if (!start) return null;
      return {
        source: 'Indivisible Lab',
        title: unescapeIcal(ev.SUMMARY) || '(no title)',
        description: unescapeIcal(ev.DESCRIPTION) || '',
        start,
        end,
        location: unescapeIcal(ev.LOCATION) || '',
        link: ev.URL || '',
      };
    })
    .filter((ev) => ev && ev.start >= now && ev.start <= cutoff);
}

// --- Fetch Mobilize.us events ---

async function fetchMobilize(queryConfig, daysAhead) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 86400000);
  const nowSec = Math.floor(now.getTime() / 1000);
  const cutoffSec = Math.floor(cutoff.getTime() / 1000);

  // Build query string from params
  const parts = [`timeslot_start=gte_${nowSec}`, `timeslot_start=lte_${cutoffSec}`, 'per_page=50'];
  for (const [key, val] of Object.entries(queryConfig.params)) {
    if (Array.isArray(val)) {
      for (const v of val) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  }

  const apiUrl = `${MOBILIZE_API_URL}?${parts.join('&')}`;
  const json = await httpGet(apiUrl);
  const data = JSON.parse(json);

  if (!data.data) return [];

  const events = [];
  for (const ev of data.data) {
    // Each event can have multiple timeslots; emit one entry per upcoming timeslot
    for (const ts of ev.timeslots || []) {
      const startMs = ts.start_date * 1000;
      const endMs = ts.end_date * 1000;
      if (startMs < now.getTime() || startMs > cutoff.getTime()) continue;

      const loc = ev.location || {};
      let locationStr = '';
      if (loc.venue) locationStr = loc.venue;
      if (loc.locality) locationStr += (locationStr ? ', ' : '') + loc.locality;
      if (loc.region) locationStr += ' ' + loc.region;

      events.push({
        source: queryConfig.label,
        title: ev.title || '(no title)',
        description: ev.summary || '',
        start: new Date(startMs),
        end: new Date(endMs),
        location: locationStr.trim(),
        link: ev.browser_url || '',
      });
    }
  }
  return events;
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const csvOutput = args.includes('--csv');
  const daysIdx = args.indexOf('--days');
  const daysAhead = daysIdx !== -1 ? parseInt(args[daysIdx + 1]) || 14 : 14;

  console.error(`Fetching events for the next ${daysAhead} days...\n`);

  let allEvents = [];

  try {
    const gcalEvents = await fetchGoogleCalendar(daysAhead);
    console.error(`  Google Calendar: ${gcalEvents.length} events`);
    allEvents = allEvents.concat(gcalEvents);
  } catch (err) {
    console.error(`  Google Calendar: ERROR - ${err.message}`);
  }

  try {
    const tockifyEvents = await fetchTockify(daysAhead);
    console.error(`  Tockify: ${tockifyEvents.length} events`);
    allEvents = allEvents.concat(tockifyEvents);
  } catch (err) {
    console.error(`  Tockify: ERROR - ${err.message}`);
  }

  try {
    const indivisibleEvents = await fetchIndivisibleLab(daysAhead);
    console.error(`  Indivisible Lab: ${indivisibleEvents.length} events`);
    allEvents = allEvents.concat(indivisibleEvents);
  } catch (err) {
    console.error(`  Indivisible Lab: ERROR - ${err.message}`);
  }

  // Fetch all 4 Mobilize queries
  for (const mq of MOBILIZE_QUERIES) {
    try {
      const mEvents = await fetchMobilize(mq, daysAhead);
      allEvents = allEvents.concat(mEvents);
      console.error(`  ${mq.label}: ${mEvents.length} events`);
    } catch (err) {
      console.error(`  ${mq.label}: ERROR - ${err.message}`);
    }
  }

  // Filter by allowed towns (keep blank locations)
  const beforeFilter = allEvents.length;
  allEvents = allEvents.filter((ev) => {
    if (!ev.location) return true;
    const loc = ev.location.toLowerCase();
    return ALLOWED_TOWNS.some((town) => loc.includes(town));
  });
  console.error(`\n  Location filter: ${beforeFilter} → ${allEvents.length} events\n`);

  // Remove duplicate events (same title and start time)
  const seen = new Set();
  const beforeDedup = allEvents.length;
  allEvents = allEvents.filter((ev) => {
    const key = `${(ev.title || '').toLowerCase().trim()}|${(ev.location || '').toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.error(`  Dedup filter: ${beforeDedup} → ${allEvents.length} events\n`);

  // Sort by start date
  allEvents.sort((a, b) => {
    if (!a.start) return 1;
    if (!b.start) return -1;
    return a.start - b.start;
  });

  if (csvOutput) {
    const csvEscape = (s) => '"' + String(s || '').replace(/"/g, '""') + '"';
    console.log('date,location,name,link,source');
    for (const ev of allEvents) {
      const dateStr = ev.start
        ? ev.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
          + ' ' + ev.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : '';
      console.log([csvEscape(dateStr), csvEscape(ev.location), csvEscape(ev.title), csvEscape(ev.link), csvEscape(ev.source)].join(','));
    }
  } else if (jsonOutput) {
    console.log(JSON.stringify(allEvents, null, 2));
  } else {
    console.log(`\n=== ${allEvents.length} Events (next ${daysAhead} days / 2 weeks) ===\n`);
    for (const ev of allEvents) {
      const dateStr = ev.start
        ? ev.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        : 'N/A';
      const timeStr = ev.start
        ? ev.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : '';
      const endTimeStr = ev.end
        ? ev.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : '';

      console.log(`📅 ${dateStr}${timeStr ? '  ' + timeStr : ''}${endTimeStr ? ' – ' + endTimeStr : ''}`);
      console.log(`   ${ev.title}`);
      if (ev.location) console.log(`   📍 ${ev.location}`);
      if (ev.link) console.log(`   🔗 ${ev.link}`);
      console.log(`   [${ev.source}]`);
      console.log('');
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
