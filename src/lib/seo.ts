import type { Metadata } from "next";
import {
  locationFullName,
  locationShortPlace,
  type Location,
} from "@/lib/locations";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import { differenceCopy, exampleConversionCopy, type ConversionSnapshot } from "@/lib/converter";

export function converterTitle(from: Location, to: Location) {
  const toLabel = to.abbreviation && to.kind === "timezone" ? to.abbreviation : to.name;
  return `${from.name} to ${toLabel} Time Converter`;
}

export function converterDescription(from: Location, to: Location, snapshot?: ConversionSnapshot) {
  const base = `Convert ${locationFullName(from)} time to ${locationFullName(to)}. Compare live local time, UTC offsets, daylight saving changes, working-hour overlap, and a 24-hour conversion table.`;
  if (!snapshot) return base;
  return `${differenceCopy(snapshot)} ${exampleConversionCopy(snapshot)} ${base}`;
}

export function converterMetadata(from: Location, to: Location, snapshot: ConversionSnapshot): Metadata {
  const title = converterTitle(from, to);
  const description = converterDescription(from, to, snapshot);
  const path = `/converter/${from.slug}-to-${to.slug}`;
  const url = `${getSiteUrl()}${path}`;
  const keywords = [
    `${from.name} to ${to.name} time converter`,
    `${from.name} time to ${to.name}`,
    `${locationShortPlace(from)} ${to.abbreviation ?? to.name}`,
    "time zone converter",
    "world clock",
    snapshot.fromAbbrev,
    snapshot.toAbbrev,
    from.iana,
    to.iana,
  ];
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

function hourPhrase(hours: number) {
  const abs = Math.abs(hours);
  return `${abs} ${abs === 1 ? "hour" : "hours"}`;
}

function nineAmFaqAnswer(from: Location, to: Location, snapshot: ConversionSnapshot) {
  const row = snapshot.table.find((entry) => entry.fromHour === 9);
  if (!row) return exampleConversionCopy(snapshot);
  const extra = row.dayDeltaLabel ? ` (${row.dayDeltaLabel})` : "";
  return `9:00 am in ${locationShortPlace(from)} is ${row.toLabel12}${extra} in ${locationShortPlace(to)}.`;
}

function dstFaqAnswer(from: Location, to: Location, snapshot: ConversionSnapshot) {
  if (!snapshot.fromDst.usesDst && !snapshot.toDst.usesDst) {
    return `No. Neither ${from.name} nor ${to.name} currently changes clocks for daylight saving, so the offset stays ${hourPhrase(snapshot.hoursAhead)} all year.`;
  }
  const fromBit = snapshot.fromDst.usesDst ? "changes clocks seasonally" : "keeps a fixed offset";
  const toBit = snapshot.toDst.usesDst ? "changes clocks seasonally" : "keeps a fixed offset";
  const gaps = snapshot.yearDiffs.map((diff) => hourPhrase(diff.hours)).join(" or ");
  return `Yes. ${from.name} ${fromBit}, and ${to.name} ${toBit}. That is why the gap can be ${gaps}.`;
}

export function faqItems(from: Location, to: Location, snapshot: ConversionSnapshot) {
  return [
    {
      question: `What is the time difference between ${from.name} and ${to.name}?`,
      answer: differenceCopy(snapshot),
    },
    {
      question: `What time is it in ${to.name} when it is 9:00 am in ${from.name}?`,
      answer: nineAmFaqAnswer(from, to, snapshot),
    },
    {
      question: `Does daylight saving change ${from.name} to ${to.name} conversion?`,
      answer: dstFaqAnswer(from, to, snapshot),
    },
    {
      question: `When is a good time for a call between ${from.name} and ${to.name}?`,
      answer: snapshot.meeting?.note ??
        `There is little shared office-hour overlap. Early evening in ${locationShortPlace(from)} is often the least painful window for ${locationShortPlace(to)}.`,
    },
  ];
}

export function converterJsonLd(
  from: Location,
  to: Location,
  snapshot: ConversionSnapshot,
) {
  const url = `${getSiteUrl()}/converter/${from.slug}-to-${to.slug}`;
  const faqs = faqItems(from, to, snapshot);
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: converterTitle(from, to),
      url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: converterDescription(from, to, snapshot),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl() },
        { "@type": "ListItem", position: 2, name: "Time converter", item: `${getSiteUrl()}/converter` },
        { "@type": "ListItem", position: 3, name: converterTitle(from, to), item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];
}
