import Link from "next/link";
import { PairSearch } from "@/components/location-search";
import { getLocation } from "@/lib/locations";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-teal-950">That converter was not found</h1>
      <p className="mt-3 text-stone-700">
        Hourbridge only maps cities and zones in the directory. Search below, or open the{" "}
        <Link href="/converter/wa-seattle-to-hkt" className="text-teal-800 underline">
          Seattle to HKT
        </Link>{" "}
        converter.
      </p>
      <div className="mt-6">
        <PairSearch
          initialFrom={getLocation("wa-seattle") ?? undefined}
          initialTo={getLocation("hkt") ?? undefined}
        />
      </div>
    </div>
  );
}
