"use client";

import { useEffect, useState } from "react";
import { AnalogClock } from "@/components/analog-clock";
import { locationFullName, locationShortPlace, type Location } from "@/lib/locations";
import {
  formatClock,
  formatOffset,
  getOffsetMinutes,
  getZoneParts,
  zoneAbbreviation,
} from "@/lib/time";

export function LivePlaceCard({
  location,
  initialIso,
  hour12,
}: {
  location: Location;
  initialIso: string;
  hour12: boolean;
}) {
  const [now, setNow] = useState(() => new Date(initialIso));

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = getZoneParts(now, location.iana);
  const offset = getOffsetMinutes(location.iana, now);
  const abbrev = zoneAbbreviation(location.iana, now, location.abbreviation);
  const night = parts.hour >= 19 || parts.hour < 6;

  return (
    <section
      className={`rounded-xl border bg-white p-4 shadow-sm ${night ? "ring-1 ring-slate-200" : ""}`}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <AnalogClock parts={parts} />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
            {abbrev} · {formatOffset(offset)}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-teal-950">
            {location.name}
          </h2>
          <p className="text-sm text-muted-foreground">{locationFullName(location)}</p>
          <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-teal-950">
            {formatClock(parts, hour12)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {parts.weekday} · {parts.month.toString().padStart(2, "0")}/{parts.day.toString().padStart(2, "0")}/{parts.year}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{location.iana}</p>
        </div>
      </div>
    </section>
  );
}

export function HourTimeline({
  location,
  hour,
}: {
  location: Location;
  hour: number;
}) {
  return (
    <div className="mt-3">
      <div className="flex h-3 overflow-hidden rounded-full">
        {Array.from({ length: 24 }, (_, index) => {
          const isNow = index === hour;
          const night = index >= 22 || index < 6;
          const evening = index >= 18 && index < 22;
          return (
            <span
              key={index}
              title={`${index}:00 in ${locationShortPlace(location)}`}
              className={`relative flex-1 ${
                isNow
                  ? "bg-amber-400"
                  : night
                    ? "bg-slate-800"
                    : evening
                      ? "bg-orange-300"
                      : "bg-sky-300"
              }`}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
        <span>12am</span>
      </div>
    </div>
  );
}
