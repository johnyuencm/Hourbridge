import type { Metadata } from "next";
import { AdSlot } from "@/components/ad-slot";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the converter",
  description:
    "How Hourbridge converts time between cities, why daylight saving changes the gap, and how to connect Google AdSense.",
  alternates: { canonical: `${getSiteUrl()}/about` },
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-teal-950">
        About {SITE_NAME}
      </h1>
      <p className="mt-4 text-stone-700 leading-7">
        {SITE_NAME} is a world clock and city-to-city converter. Each pair page is a real URL
        you can index, share, and reopen later — for example Seattle to Hong Kong Time at{" "}
        <code className="rounded bg-stone-200 px-1">/converter/wa-seattle-to-hkt</code>.
      </p>
      <AdSlot placement="inArticle" className="my-6 hidden md:flex" />
      <h2 className="mt-8 text-xl font-semibold text-teal-950">How conversion works</h2>
      <p className="mt-2 text-stone-700 leading-7">
        The app never stores a single “Seattle is UTC−8” constant. It asks the Intl API for the
        IANA zone at that instant, so Pacific Daylight Time and Pacific Standard Time both show
        up when they should. Hong Kong Time stays UTC+8 all year, which is why the Seattle gap
        is usually 15 hours in summer and 16 hours in winter.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-teal-950">Google Ads</h2>
      <p className="mt-2 text-stone-700 leading-7">
        Leaderboard, rectangle, in-article, footer, and mobile banner slots are reserved on every
        converter page. They render labeled placeholders until you set{" "}
        <code className="rounded bg-stone-200 px-1">NEXT_PUBLIC_ADSENSE_CLIENT</code> and the
        matching slot IDs. <code className="rounded bg-stone-200 px-1">/ads.txt</code> is generated
        from the same client id.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-teal-950">SEO</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
        <li>Unique title, description, and canonical on every pair and city page</li>
        <li>FAQ, breadcrumb, and WebApplication JSON-LD</li>
        <li>XML sitemap covering hub converter pairs and world-clock cities</li>
        <li>Server-rendered conversion tables so crawlers see the hour mapping</li>
        <li>Open Graph images generated per converter slug</li>
      </ul>
    </div>
  );
}
