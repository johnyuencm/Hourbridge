import type { Metadata } from "next";
import { AdSlot } from "@/components/ad-slot";
import { PairSearch } from "@/components/location-search";
import { getLocation, HUB_SLUGS, POPULAR_PAIRS, locationShortPlace } from "@/lib/locations";
import { getSiteUrl } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Time Zone Converter",
  description:
    "Search any city or time zone, then compare live local time, UTC offsets, daylight saving, and a 24-hour conversion table.",
  alternates: { canonical: `${getSiteUrl()}/converter` },
};

export default function ConverterIndexPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-teal-950">Time zone converter</h1>
      <p className="mt-2 max-w-2xl text-stone-700">
        Search by city, country, or abbreviation such as HKT, PST, IST, UTC, and GMT. Add two
        places to compare local times, adjust the date, and copy a permanent link.
      </p>
      <div className="mt-6">
        <PairSearch
          initialFrom={getLocation("wa-seattle") ?? undefined}
          initialTo={getLocation("hkt") ?? undefined}
        />
      </div>
      <AdSlot placement="top" className="hidden py-8 md:flex" />
      <AdSlot placement="mobile" className="flex py-6 md:hidden" />

      <h2 className="mt-4 text-xl font-semibold text-teal-950">Start with a popular pair</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {POPULAR_PAIRS.map(([fromSlug, toSlug]) => {
          const from = getLocation(fromSlug);
          const to = getLocation(toSlug);
          if (!from || !to) return null;
          return (
            <li key={`${fromSlug}-${toSlug}`}>
              <Link
                href={`/converter/${fromSlug}-to-${toSlug}`}
                className="block rounded-lg border bg-white px-4 py-3 text-sm hover:border-teal-700"
              >
                {locationShortPlace(from)} → {locationShortPlace(to)}
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-teal-950">Hub cities and zones</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {HUB_SLUGS.map((slug) => {
          const location = getLocation(slug);
          if (!location) return null;
          return (
            <li key={slug}>
              <Link
                href={`/time/${slug}`}
                className="rounded-full border bg-white px-3 py-1 text-sm hover:border-teal-700"
              >
                {location.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
