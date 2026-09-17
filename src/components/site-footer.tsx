import Link from "next/link";
import { POPULAR_PAIRS, getLocation, locationShortPlace } from "@/lib/locations";
import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-teal-950 text-teal-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-semibold text-white">{SITE_NAME}</p>
          <p className="mt-2 max-w-sm text-sm text-teal-200/80">
            Convert any city time, including daylight saving. Built for meeting planners, remote
            teams, and travelers.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Popular converters</p>
          <ul className="mt-2 space-y-1 text-sm">
            {POPULAR_PAIRS.slice(0, 6).map(([fromSlug, toSlug]) => {
              const from = getLocation(fromSlug);
              const to = getLocation(toSlug);
              if (!from || !to) return null;
              return (
                <li key={`${fromSlug}-${toSlug}`}>
                  <Link
                    href={`/converter/${fromSlug}-to-${toSlug}`}
                    className="hover:text-white"
                  >
                    {locationShortPlace(from)} → {locationShortPlace(to)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Site</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/converter" className="hover:text-white">
                Time converter
              </Link>
            </li>
            <li>
              <Link href="/time" className="hover:text-white">
                World clock
              </Link>
            </li>
            <li>
              <Link href="/time-zones" className="hover:text-white">
                Time zone index
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                About & DST notes
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-teal-200/70">
        © {new Date().getFullYear()} {SITE_NAME}. Times use IANA zone data via the browser and
        server Intl APIs.
      </p>
    </footer>
  );
}
