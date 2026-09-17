import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { uniqueIanaZones } from "@/lib/locations";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Time Zone Index",
  description:
    "IANA time zones used on Hourbridge, with representative cities and converters into other regions.",
  alternates: { canonical: `${getSiteUrl()}/time-zones` },
};

export default function TimeZonesPage() {
  const zones = uniqueIanaZones();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-teal-950">Time zones</h1>
      <p className="mt-2 max-w-2xl text-stone-700">
        Hourbridge converts with IANA identifiers such as America/Los_Angeles and Asia/Hong_Kong,
        not with a single frozen offset. That is how daylight saving is applied correctly.
      </p>
      <AdSlot placement="top" className="my-6 hidden md:flex" />
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="bg-teal-950 text-teal-50">
            <tr>
              <th className="px-3 py-2 font-medium">IANA zone</th>
              <th className="px-3 py-2 font-medium">Representative place</th>
              <th className="px-3 py-2 font-medium">Country</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((location) => (
              <tr key={location.iana} className="border-b">
                <td className="px-3 py-2 font-mono text-xs">{location.iana}</td>
                <td className="px-3 py-2">
                  <Link href={`/time/${location.slug}`} className="text-teal-800 hover:underline">
                    {location.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{location.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
