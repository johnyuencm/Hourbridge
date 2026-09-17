import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ad-slot";
import { ConverterView, TimezoneFacts } from "@/components/converter-view";
import { JsonLd } from "@/components/json-ld";
import { buildSnapshot, pairPath } from "@/lib/converter";
import {
  converterSlug,
  getStaticConverterSlugs,
  parseConverterSlug,
  relatedDestinations,
  locationShortPlace,
} from "@/lib/locations";
import { converterJsonLd, converterMetadata, converterTitle, faqItems } from "@/lib/seo";
import { parseDateInput, parseTimeInput, zonedTimeToUtc } from "@/lib/time";

export const revalidate = 60;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; time?: string }>;
};

export function generateStaticParams() {
  return getStaticConverterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pair = parseConverterSlug(slug);
  if (!pair) return { title: "Converter not found" };
  const instant = resolveInstant(pair.from.iana, await searchParams);
  const snapshot = buildSnapshot(pair.from, pair.to, instant);
  return converterMetadata(pair.from, pair.to, snapshot);
}

function resolveInstant(timeZone: string, search: { date?: string; time?: string }) {
  const date = parseDateInput(search.date);
  if (!date) return new Date();
  const time = parseTimeInput(search.time);
  return zonedTimeToUtc(timeZone, date.year, date.month, date.day, time.hour, time.minute);
}

export default async function ConverterPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const pair = parseConverterSlug(slug);
  if (!pair) notFound();
  const { from, to } = pair;
  const snapshot = buildSnapshot(from, to, resolveInstant(from.iana, await searchParams));
  const faqs = faqItems(from, to, snapshot);
  const related = relatedDestinations(from, to);

  return (
    <div className="bg-[#f6f3ec]">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex flex-wrap gap-1">
              <li>
                <Link href="/" className="hover:text-teal-800">
                  Home
                </Link>
                <span aria-hidden="true"> / </span>
              </li>
              <li>
                <Link href="/converter" className="hover:text-teal-800">
                  Converter
                </Link>
                <span aria-hidden="true"> / </span>
              </li>
              <li className="text-teal-950">{converterTitle(from, to)}</li>
            </ol>
          </nav>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-teal-950 md:text-4xl">
            {from.name} to {to.kind === "timezone" && to.abbreviation ? to.abbreviation : to.name}{" "}
            Time Converter
          </h1>
          <p className="mt-2 max-w-3xl text-stone-700">
            Compare {locationShortPlace(from)} time with {locationShortPlace(to)}, including
            current local time, UTC offsets, daylight saving changes, working hours, and a
            shareable conversion table.
          </p>
          <AdSlot placement="mobile" className="my-5 flex md:hidden" />
          <AdSlot placement="top" className="my-5 hidden md:flex" />

          <ConverterView from={from} to={to} initial={snapshot} />

          <section className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-teal-950">Time difference</h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              {snapshot.fromAbbrev} is {formatSignedHours(snapshot.hoursAhead)} {locationShortPlace(to)}.{" "}
              {exampleLine(snapshot)}
            </p>
          </section>

          <section className="mt-6">
            <TimezoneFacts snapshot={snapshot} />
          </section>

          <AdSlot placement="inArticle" className="my-6 hidden md:flex" />

          <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-teal-950">Frequently asked questions</h2>
            <div className="mt-4 space-y-4">
              {faqs.map((item) => (
                <div key={item.question}>
                  <h3 className="text-sm font-semibold text-teal-950">{item.question}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-700">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-teal-950">
              Other converters from {from.name}
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {related.map((hub) => (
                <li key={hub.slug}>
                  <Link
                    href={pairPath(from, hub)}
                    className="text-sm text-teal-800 hover:underline"
                  >
                    {from.name} to {hub.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={pairPath(to, from)} className="text-sm text-teal-800 hover:underline">
                  Reverse: {to.name} to {from.name}
                </Link>
              </li>
            </ul>
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <AdSlot placement="sidebar" />
          <nav className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-teal-950">On this page</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <a href="#main" className="text-teal-800 hover:underline">
                  Live clocks
                </a>
              </li>
              <li>
                <Link href={`/time/${from.slug}`} className="text-teal-800 hover:underline">
                  {from.name} world clock
                </Link>
              </li>
              <li>
                <Link href={`/time/${to.slug}`} className="text-teal-800 hover:underline">
                  {to.name} world clock
                </Link>
              </li>
              <li>
                <Link href={`/converter/${converterSlug(to, from)}`} className="text-teal-800 hover:underline">
                  Flip the conversion
                </Link>
              </li>
            </ul>
          </nav>
          <AdSlot placement="sidebar" className="hidden lg:flex" />
        </aside>
      </div>
      {converterJsonLd(from, to, snapshot).map((block, index) => (
        <JsonLd key={index} data={block} />
      ))}
    </div>
  );
}

function formatSignedHours(hours: number) {
  const abs = Math.abs(hours);
  const word = abs === 1 ? "hour" : "hours";
  if (hours === 0) return "the same local time as";
  if (hours > 0) return `${abs} ${word} behind`;
  return `${abs} ${word} ahead of`;
}

function exampleLine(snapshot: ReturnType<typeof buildSnapshot>) {
  const fromH = snapshot.fromParts.hour;
  const fromM = snapshot.fromParts.minute.toString().padStart(2, "0");
  const toH = snapshot.toParts.hour;
  const toM = snapshot.toParts.minute.toString().padStart(2, "0");
  return `${fromH}:${fromM} in ${locationShortPlace(snapshot.from)} is ${toH}:${toM} in ${locationShortPlace(snapshot.to)}.`;
}
