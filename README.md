# Hourbridge

City-to-city time converter and world clock, in the same shape as a Savvy Time pair page: live analog clocks, DST-aware offsets, meeting overlap, and a 24-hour conversion table. Every pair is a crawlable URL.

Production: [https://hourbridge.vercel.app](https://hourbridge.vercel.app)

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

## SEO: what is already in the product

Google ranks converter queries when each city pair is a real page with unique copy, not a client-only widget.

Already shipped:

- One URL per pair (`/converter/{from}-to-{to}`) and per city (`/time/{slug}`)
- Unique `<title>`, meta description, canonical, and Open Graph image
- Visible H1, FAQ, breadcrumbs, and related-pair internal links
- FAQ / Breadcrumb / WebApplication JSON-LD on converters; WebSite JSON-LD sitewide
- Server-rendered 24-hour tables (crawlers do not need JavaScript to see the mapping)
- [https://hourbridge.vercel.app/sitemap.xml](https://hourbridge.vercel.app/sitemap.xml) and [robots.txt](https://hourbridge.vercel.app/robots.txt)

## SEO: what you do in Google and Vercel

1. **Keep the site public.** In the Vercel project, turn off Deployment Protection / Vercel Authentication for Production. Googlebot cannot index a login wall.
2. **Pin the public origin.** In Vercel → Project → Settings → Environment Variables, set for Production (and Preview if you want):
   - `NEXT_PUBLIC_SITE_URL` = `https://hourbridge.vercel.app`
   - Redeploy after saving. `NEXT_PUBLIC_*` values are baked in at build time.
3. **Search Console.** Go to [Google Search Console](https://search.google.com/search-console), add the URL prefix `https://hourbridge.vercel.app`. Choose the HTML tag method, copy only the `content` token, and set:
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = that token
   - Redeploy, then click Verify.
4. **Submit the sitemap.** In Search Console → Sitemaps, submit `https://hourbridge.vercel.app/sitemap.xml`.
5. **Request indexing** on the money pages first: `/`, `/converter/wa-seattle-to-hkt`, `/converter`, `/time/wa-seattle`.
6. **Custom domain (later).** Point the domain at this Vercel project, set `NEXT_PUBLIC_SITE_URL` to `https://your-domain.com`, add that property in Search Console, and keep a 301 from the old host.

Do not expect rankings the same day. Google has to recrawl. The work that moves the needle after this is more unique pair copy and links to those URLs, not extra meta tags.

## Google AdSense: connect the site

Slots are already reserved on converter, city, home, and footer. They stay dashed placeholders until AdSense is approved and slot ids are set.

The publisher snippet is already live (`ca-pub-5437937713747043`). You do not need to paste the `<script>` again.

1. Use the **website** AdSense product at [adsense.google.com](https://www.google.com/adsense) — not AdSense for YouTube.
2. **Sites → + New site** and enter `https://hourbridge.vercel.app`.
3. Confirm three things on production (already true after the latest deploy):
   - View source: `<meta name="google-adsense-account" content="ca-pub-5437937713747043">`
   - Script: `adsbygoogle.js?client=ca-pub-5437937713747043`
   - [https://hourbridge.vercel.app/ads.txt](https://hourbridge.vercel.app/ads.txt) is exactly:
     `google.com, pub-5437937713747043, DIRECT, f08c47fec0942fa0`
     (`pub-`, not `ca-pub-`)
4. Back in AdSense, click **Verify** / **Request review**. Approval can take days. Ads will not fill before the site status is Ready. Optional: set `NEXT_PUBLIC_ADSENSE_CLIENT` on Vercel if you ever rotate publisher ids.
5. After Ready, **Ads → By ad unit → Display ads** and create units that match the reserved sizes:

| Placement | Size | Env var |
| --- | --- | --- |
| Top / in-article / footer | 728×90 | `NEXT_PUBLIC_ADSENSE_SLOT_TOP` / `_INARTICLE` / `_FOOTER` |
| Sidebar | 300×250 | `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` |
| Mobile | 320×100 | `NEXT_PUBLIC_ADSENSE_SLOT_MOBILE` |

Paste only the numeric slot id (not `ca-pub-`). Redeploy again. Until those variables are set, the layout still reserves the space so CLS stays stable.

Use **manual display units** for these slots. Do not also turn on Auto ads overlays on the same pages, or Google will stack ads on top of the reserved units.

Malformed publisher or slot ids are ignored so they cannot inject extra `ads.txt` rows.

## Policy notes that affect both SEO and ads

- Converter pages need substantial unique text (already: DST notes, FAQ, table, city facts). Thin doorway pages get filtered.
- Do not cloak, buy links, or hide the converter behind a login.
- AdSense will reject a site that is only placeholders. Keep the real converter as the main content; ads sit around it.
- Disconnect extra Vercel projects (`hourbridge-app`, `hourbridge-site`) so you do not split signals across three hosts.
