import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { PairSearch } from "@/components/location-search";
import { getLocation, LOCATIONS, POPULAR_PAIRS, locationShortPlace } from "@/lib/locations";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — World Clock and Time Converter` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: getSiteUrl() },
};

export default function HomePage() {
  const seattle = getLocation("wa-seattle")!;
  const hkt = getLocation("hkt")!;

  return (
    <div className="bg-[radial-gradient(circle_at_top,_#d7eee9,_transparent_42%),linear-gradient(#f7f4ee,#f4f1ea)]">
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 md:pt-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">
          World clock · DST aware
        </p>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-teal-950 md:text-5xl">
          Convert city time the way you actually schedule meetings.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-stone-700">
          Pick two places, see live clocks, the current gap, daylight saving shifts, and a
          24-hour table. Start with Seattle to Hong Kong Time — the same style of converter
          people use for trans-Pacific calls.
        </p>
        <div className="mt-8">
          <PairSearch initialFrom={seattle} initialTo={hkt} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Or jump straight to{" "}
          <Link href="/converter/wa-seattle-to-hkt" className="font-medium text-teal-800 underline">
            Seattle to HKT
          </Link>
          .
        </p>
      </section>
      <AdSlot placement="top" className="hidden px-4 pb-8 md:flex" />
      <AdSlot placement="mobile" className="flex px-4 pb-8 md:hidden" />

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-2xl font-semibold text-teal-950">Popular converters</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          High-traffic city pairs, each with its own indexable conversion page.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_PAIRS.map(([fromSlug, toSlug]) => {
            const from = getLocation(fromSlug);
            const to = getLocation(toSlug);
            if (!from || !to) return null;
            return (
              <li key={`${fromSlug}-${toSlug}`}>
                <Link
                  href={`/converter/${fromSlug}-to-${toSlug}`}
                  className="block rounded-xl border bg-white p-4 shadow-sm transition hover:border-teal-700 hover:shadow"
                >
                  <p className="font-medium text-teal-950">
                    {from.name} → {to.abbreviation && to.kind === "timezone" ? to.abbreviation : to.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {locationShortPlace(from)} to {locationShortPlace(to)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-3">
        {[
          {
            title: "Live clocks",
            body: "Analog faces and digital time update every second, with UTC offset and the IANA zone name.",
          },
          {
            title: "Daylight saving built in",
            body: "Hourbridge uses zone data, not a fixed offset, so March and November changes show up in the table.",
          },
          {
            title: "Meeting overlap",
            body: "Each pair page suggests a call window when both sides are closest to office hours.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-teal-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-2xl font-semibold text-teal-950">World clock cities</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Open a city page for local time, offset, and links into converters.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {LOCATIONS.filter((location) => location.kind === "city")
            .slice(0, 28)
            .map((location) => (
              <Link
                key={location.slug}
                href={`/time/${location.slug}`}
                className="rounded-full border bg-white px-3 py-1 text-sm text-teal-900 hover:border-teal-700"
              >
                {location.name}
              </Link>
            ))}
          <Link href="/time" className="rounded-full bg-teal-900 px-3 py-1 text-sm text-white">
            All cities
          </Link>
        </div>
      </section>
    </div>
  );
}
