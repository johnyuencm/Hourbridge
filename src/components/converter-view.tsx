"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeftRightIcon } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { HourTimeline, LivePlaceCard } from "@/components/live-place-card";
import { LocationSearch } from "@/components/location-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildSnapshot,
  differenceCopy,
  exampleConversionCopy,
  pairPath,
  seasonalDifferenceCopy,
  type ConversionSnapshot,
} from "@/lib/converter";
import { locationFullName, locationShortPlace, type Location } from "@/lib/locations";
import {
  formatClockShort,
  formatOffset,
  parseDateInput,
  parseTimeInput,
  resolveZonedTime,
  toDateInput,
  toTimeInput,
  type ZonedTimeResolution,
} from "@/lib/time";
import { cn } from "@/lib/utils";

export function ConverterView({
  from,
  to,
  initial,
}: {
  from: Location;
  to: Location;
  initial: ConversionSnapshot;
}) {
  const router = useRouter();
  const [hour12, setHour12] = useState(true);
  const [dateValue, setDateValue] = useState(toDateInput(initial.fromParts));
  const [timeValue, setTimeValue] = useState(toTimeInput(initial.fromParts));
  const [picking, setPicking] = useState<"from" | "to" | null>(null);

  const resolvedLocal = useMemo((): ZonedTimeResolution | null => {
    const date = parseDateInput(dateValue);
    if (!date) return null;
    const time = parseTimeInput(timeValue);
    return resolveZonedTime(from.iana, date.year, date.month, date.day, time.hour, time.minute);
  }, [dateValue, timeValue, from.iana]);

  const snapshot = useMemo(() => {
    if (!resolvedLocal) return initial;
    return buildSnapshot(from, to, resolvedLocal.instant, resolvedLocal.resolved.hour);
  }, [resolvedLocal, from, to, initial]);

  const dstLocalWarning = useMemo(() => {
    if (!resolvedLocal || resolvedLocal.status === "ok") return null;
    const shown = formatClockShort(resolvedLocal.resolved, hour12);
    if (resolvedLocal.status === "gap") {
      return `That local time does not exist in ${from.name} (DST spring forward). Showing ${shown} instead.`;
    }
    return `That local time is ambiguous in ${from.name} (DST fall back). Using the earlier occurrence (${shown}).`;
  }, [resolvedLocal, hour12, from.name]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">Date</span>
            <Input
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              className="h-9 w-[11.5rem] bg-white"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">Time in {from.name}</span>
            <Input
              type="time"
              value={timeValue}
              onChange={(event) => setTimeValue(event.target.value)}
              className="h-9 w-[8.5rem] bg-white"
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={hour12 ? "default" : "outline"}
            className={hour12 ? "bg-teal-800 hover:bg-teal-900" : ""}
            onClick={() => setHour12(true)}
          >
            12-hour
          </Button>
          <Button
            type="button"
            variant={!hour12 ? "default" : "outline"}
            className={!hour12 ? "bg-teal-800 hover:bg-teal-900" : ""}
            onClick={() => setHour12(false)}
          >
            24-hour
          </Button>
        </div>
      </div>

      {dstLocalWarning ? (
        <p
          role="status"
          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        >
          {dstLocalWarning}
        </p>
      ) : null}

      <div className="relative grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div>
          {picking === "from" ? (
            <LocationSearch
              autoFocus
              onSelect={(location) => {
                setPicking(null);
                if (location.slug !== to.slug) router.push(pairPath(location, to));
              }}
            />
          ) : (
            <button
              type="button"
              className="mb-2 text-xs font-medium text-teal-800 hover:underline"
              onClick={() => setPicking("from")}
            >
              Change origin
            </button>
          )}
          <LivePlaceCard location={from} initialIso={initial.instantIso} hour12={hour12} />
          <HourTimeline location={from} hour={snapshot.fromParts.hour} />
        </div>
        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full bg-white"
            aria-label={`Swap ${from.name} and ${to.name}`}
            onClick={() => router.push(pairPath(to, from))}
          >
            <ArrowLeftRightIcon />
          </Button>
        </div>
        <div>
          {picking === "to" ? (
            <LocationSearch
              autoFocus
              onSelect={(location) => {
                setPicking(null);
                if (location.slug !== from.slug) router.push(pairPath(from, location));
              }}
            />
          ) : (
            <button
              type="button"
              className="mb-2 text-xs font-medium text-teal-800 hover:underline"
              onClick={() => setPicking("to")}
            >
              Change destination
            </button>
          )}
          <LivePlaceCard location={to} initialIso={initial.instantIso} hour12={hour12} />
          <HourTimeline location={to} hour={snapshot.toParts.hour} />
        </div>
      </div>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-teal-950">Selected conversion</h2>
        <p className="mt-2 text-sm leading-6 text-stone-700">{exampleConversionCopy(snapshot)}</p>
        <p className="mt-2 text-sm leading-6 text-stone-700">{differenceCopy(snapshot)}</p>
        <p className="mt-2 text-sm leading-6 text-stone-700">{seasonalDifferenceCopy(snapshot)}</p>
        {snapshot.workHourNotes.map((note) => (
          <p key={note} className="mt-2 text-sm leading-6 text-stone-700">
            {note}
          </p>
        ))}
      </section>

      <section className="rounded-xl border bg-amber-50 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-teal-950">Best overlap for a call</h2>
        {snapshot.meeting ? (
          <p className="mt-2 text-sm leading-6 text-stone-800">{snapshot.meeting.note}</p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-stone-800">
            These two places barely share office hours. Try early evening in{" "}
            {locationShortPlace(from)} or early morning in {locationShortPlace(to)}.
          </p>
        )}
      </section>

      <AdSlot placement="inArticle" className="py-2" />

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-teal-950">
          {from.name} to {to.name} conversion table
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each row is one hour in {locationShortPlace(from)} on {snapshot.fromDateLabel}. Highlighted
          row is the selected hour. Green tint marks typical 9am–5pm office hours.
        </p>
        <Tabs defaultValue="12h" className="mt-4">
          <TabsList>
            <TabsTrigger value="12h">12-hour</TabsTrigger>
            <TabsTrigger value="24h">24-hour</TabsTrigger>
          </TabsList>
          <TabsContent value="12h" forceMount className="data-[state=inactive]:hidden">
            <ConversionTable snapshot={snapshot} hour12 />
          </TabsContent>
          <TabsContent value="24h" forceMount className="data-[state=inactive]:hidden">
            <ConversionTable snapshot={snapshot} hour12={false} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function ConversionTable({
  snapshot,
  hour12,
}: {
  snapshot: ConversionSnapshot;
  hour12: boolean;
}) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[20rem] border-collapse text-sm">
        <caption className="sr-only">
          Hour-by-hour conversion from {snapshot.from.name} to {snapshot.to.name}
        </caption>
        <thead>
          <tr className="border-b bg-teal-950 text-left text-teal-50">
            <th className="px-3 py-2 font-medium">{locationShortPlace(snapshot.from)}</th>
            <th className="px-3 py-2 font-medium">{locationShortPlace(snapshot.to)}</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.table.map((row) => (
            <tr
              key={`${hour12}-${row.fromHour}`}
              className={cn(
                "border-b",
                row.isNow && "bg-amber-200 font-semibold",
                !row.isNow && row.isWorkFrom && row.isWorkTo && "bg-emerald-50",
                !row.isNow && (row.isNightFrom || row.isNightTo) && "bg-slate-50",
              )}
            >
              <td className="px-3 py-1.5">
                {hour12 ? row.fromLabel12 : row.fromLabel24}
              </td>
              <td className="px-3 py-1.5">
                {hour12 ? row.toLabel12 : row.toLabel24}
                {row.dayDeltaLabel ? (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    {row.dayDeltaLabel}
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TimezoneFacts({ snapshot }: { snapshot: ConversionSnapshot }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FactCard location={snapshot.from} dst={snapshot.fromDst} offset={snapshot.fromOffset} />
      <FactCard location={snapshot.to} dst={snapshot.toDst} offset={snapshot.toOffset} />
    </div>
  );
}

function FactCard({
  location,
  dst,
  offset,
}: {
  location: Location;
  dst: ConversionSnapshot["fromDst"];
  offset: number;
}) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-teal-950">{location.name}</h2>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Place</dt>
        <dd>
          <Link href={`/time/${location.slug}`} className="text-teal-800 hover:underline">
            {locationFullName(location)}
          </Link>
        </dd>
        <dt className="text-muted-foreground">IANA zone</dt>
        <dd className="font-mono text-xs">{location.iana}</dd>
        <dt className="text-muted-foreground">UTC offset</dt>
        <dd>
          {formatOffset(offset)} ({dst.abbreviation})
        </dd>
        <dt className="text-muted-foreground">Daylight saving</dt>
        <dd>
          {dst.usesDst
            ? dst.inDst
              ? "In daylight time right now"
              : "In standard time right now"
            : "This zone does not change clocks for daylight saving"}
        </dd>
        {dst.nextChange ? (
          <>
            <dt className="text-muted-foreground">Next change</dt>
            <dd>
              {dst.nextChange.at.toLocaleString("en-US", {
                timeZone: location.iana,
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              local time, moving to {formatOffset(dst.nextChange.toOffsetMinutes)}
            </dd>
          </>
        ) : null}
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
        {location.latitude != null && location.longitude != null ? (
          <>
            <dt className="text-muted-foreground">Coordinates</dt>
            <dd>
              {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
            </dd>
          </>
        ) : null}
      </dl>
      <p className="mt-4 text-sm leading-6 text-stone-700">{location.about}</p>
    </section>
  );
}
