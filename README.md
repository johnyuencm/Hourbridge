# Hourbridge

City-to-city time converter and world clock, in the same shape as a Savvy Time pair page: live analog clocks, DST-aware offsets, meeting overlap, and a 24-hour conversion table. Every pair is a crawlable URL.

The featured route is [Seattle to Hong Kong Time](/converter/wa-seattle-to-hkt).

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

```bash
npm run build
npm start -- --hostname 127.0.0.1 --port 43123
```

## What you get

- `/converter/wa-seattle-to-hkt` and other `{from}-to-{to}` pages
- Live clocks, date/time picker, 12-hour and 24-hour tables
- Daylight saving notes and a suggested call window
- World clock pages under `/time/{city}`
- Unique titles, descriptions, canonicals, FAQ JSON-LD, Open Graph images, `sitemap.xml`, and `robots.txt`

## Google Ads

Slots are reserved (and labeled) even without credentials:

| Placement | Size | Env var |
| --- | --- | --- |
| Top / in-article / footer | 728×90 | `NEXT_PUBLIC_ADSENSE_SLOT_TOP` / `_INARTICLE` / `_FOOTER` |
| Sidebar | 300×250 | `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` |
| Mobile | 320×100 | `NEXT_PUBLIC_ADSENSE_SLOT_MOBILE` |

Set `NEXT_PUBLIC_ADSENSE_CLIENT` to your `ca-pub-…` id (digits only after `ca-pub-`). `/ads.txt` is generated from that value; malformed ids are ignored so they cannot inject extra seller rows. Until those variables are set, each slot shows a dashed placeholder so layout and CLS stay stable.

Also set `NEXT_PUBLIC_SITE_URL` to the public origin so canonicals, Open Graph tags, and the sitemap use the right host.

## SEO notes

- Pair pages are statically listed in the sitemap (hub cities × hub cities) and still resolve for any other directory pair.
- Conversion tables are rendered on the server so crawlers see the hour mapping without JavaScript.
- Clocks hydrate on the client and tick every second.
