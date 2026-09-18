import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ad-slot";
import { JsonLd } from "@/components/json-ld";
import { LivePlaceCard } from "@/components/live-place-card";
import { pairPath } from "@/lib/converter";
import {
  citiesUsingZone,
  getLocation,
  HUB_SLUGS,
  LOCATIONS,
  locationFullName,
  type Location,
} from "@/lib/locations";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import { formatOffset, getDstInfo, getOffsetMinutes, getZoneParts, zoneAbbreviation } from "@/lib/time";

export const revalidate = 60;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LOCATIONS.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return { title: "City not found" };
  const title = `Current time in ${location.name}`;
  const description = `Live local time in ${locationFullName(location)}. See the UTC offset, daylight saving status, IANA zone ${location.iana}, and converters to other cities.`;
  const url = `${getSiteUrl()}/time/${location.slug}`;
  return {
    title,
    description,
    keywords: [location.name, "local time", "world clock", location.iana, location.country],
    alternates: { canonical: url },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url, type: "website" },
  };
}

export default async function CityTimePage({ params }: PageProps) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();
  const now = new Date();
  const parts = getZoneParts(now, location.iana);
  const dst = getDstInfo(location.iana, now);
  const offset = getOffsetMinutes(location.iana, now);
  const abbrev = zoneAbbreviation(location.iana, now, location.abbreviation);
  const hubs = HUB_SLUGS.map(getLocation).filter(
    (hub): hub is Location => hub != null && hub.slug !== location.slug,
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article>
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-teal-800">
            Home
          </Link>
          {" / "}
          <Link href="/time" className="hover:text-teal-800">
            World clock
          </Link>
          {" / "}
          <span className="text-teal-950">{location.name}</span>
        </nav>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-teal-950">
          Current time in {location.name}
        </h1>
        <p className="mt-2 text-stone-700">
          {locationFullName(location)} is in {location.iana}. Right now that zone reports as{" "}
          {abbrev} ({formatOffset(offset)}).
        </p>
        <AdSlot placement="mobile" className="my-5 flex md:hidden" />
        <div className="mt-6 max-w-xl">
          <LivePlaceCard location={location} initialIso={now.toISOString()} hour12 />
        </div>
        <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-teal-950">Time zone details</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Local date</dt>
            <dd>
              {parts.weekday}, {parts.month}/{parts.day}/{parts.year}
            </dd>
            <dt className="text-muted-foreground">Offset</dt>
            <dd>{formatOffset(offset)}</dd>
            <dt className="text-muted-foreground">Daylight saving</dt>
            <dd>
              {dst.usesDst
                ? dst.inDst
                  ? "Daylight time is in effect."
                  : "Standard time is in effect."
                : "This zone does not use daylight saving."}
            </dd>
            {location.population ? (
              <>
                <dt className="text-muted-foreground">Population</dt>
                <dd>{location.population}</dd>
              </>
            ) : null}
            {location.currency ? (
              <>
                <dt className="text-muted-foreground">Currency</dt>
                <dd>{location.currency}</dd>
              </>
            ) : null}
            {location.dialingCode ? (
              <>
                <dt className="text-muted-foreground">Dialing code</dt>
                <dd>{location.dialingCode}</dd>
              </>
            ) : null}
          </dl>
          <p className="mt-4 text-sm leading-6 text-stone-700">{location.about}</p>
        </section>
        <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-teal-950">Convert {location.name} time</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {hubs.slice(0, 12).map((hub) => (
              <li key={hub.slug}>
                <Link href={pairPath(location, hub)} className="text-sm text-teal-800 hover:underline">
                  {location.name} to {hub.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        {citiesUsingZone(location.iana).filter((city) => city.slug !== location.slug).length > 0 ? (
          <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-teal-950">Same time zone</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {citiesUsingZone(location.iana)
                .filter((city) => city.slug !== location.slug)
                .map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={`/time/${city.slug}`}
                      className="rounded-full border px-3 py-1 text-sm hover:border-teal-700"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ) : null}
      </article>
      <aside className="space-y-4">
        <AdSlot placement="sidebar" />
        <AdSlot placement="sidebar" className="hidden lg:flex" />
      </aside>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Place",
          name: locationFullName(location),
          address: { "@type": "PostalAddress", addressCountry: location.countryCode },
          geo:
            location.latitude != null && location.longitude != null
              ? {
                  "@type": "GeoCoordinates",
                  latitude: location.latitude,
                  longitude: location.longitude,
                }
              : undefined,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl() },
            { "@type": "ListItem", position: 2, name: "World clock", item: `${getSiteUrl()}/time` },
            {
              "@type": "ListItem",
              position: 3,
              name: location.name,
              item: `${getSiteUrl()}/time/${location.slug}`,
            },
          ],
        }}
      />
    </div>
  );
}
