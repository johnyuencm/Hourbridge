import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { groupedCities } from "@/lib/locations";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "World Clock",
  description:
    "Current local time directory for major cities. Open a city to see live time, UTC offset, and converters into other zones.",
  alternates: { canonical: `${getSiteUrl()}/time` },
};

export default function WorldClockIndexPage() {
  const groups = groupedCities();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-teal-950">World clock</h1>
      <p className="mt-2 max-w-2xl text-stone-700">
        Choose a city to see live local time, the IANA time zone, daylight saving notes, and
        one-click converters to hubs such as London, New York, and Hong Kong Time.
      </p>
      <AdSlot placement="top" className="my-6 hidden md:flex" />
      <AdSlot placement="mobile" className="my-6 flex md:hidden" />
      <div className="space-y-8">
        {groups.map(([country, cities]) => (
          <section key={country}>
            <h2 className="text-lg font-semibold text-teal-950">{country}</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/time/${city.slug}`}
                    className="rounded-full border bg-white px-3 py-1 text-sm hover:border-teal-700"
                  >
                    {city.name}
                    {city.region ? `, ${city.region}` : ""}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
