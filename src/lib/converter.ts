import {
  converterSlug,
  locationFullName,
  locationShortPlace,
  type Location,
} from "@/lib/locations";
import {
  dayDelta,
  dayDeltaLabel,
  formatClockShort,
  formatDateLong,
  getDstInfo,
  getOffsetMinutes,
  getZoneParts,
  hourLabel12,
  hourLabel24,
  formatHoursPhrase,
  hoursBetweenOffsets,
  isNightHour,
  isWorkHour,
  yearlyDifferenceShares,
  zoneAbbreviation,
  resolveZonedTime,
  type DstInfo,
  type ZoneParts,
  type ZonedTimeStatus,
} from "@/lib/time";

export type TableRow = {
  fromHour: number;
  fromLabel12: string;
  fromLabel24: string;
  toHour: number;
  toMinute: number;
  toLabel12: string;
  toLabel24: string;
  dayDelta: number;
  dayDeltaLabel: string;
  isNow: boolean;
  isWorkFrom: boolean;
  isWorkTo: boolean;
  isNightFrom: boolean;
  isNightTo: boolean;
  /** ok / fold map to a real local hour; gap hours are skipped by DST spring-forward. */
  status: ZonedTimeStatus;
  instantIso: string | null;
};

export type MeetingWindow = {
  fromStart: string;
  fromEnd: string;
  toStart: string;
  toEnd: string;
  note: string;
};

export type ConversionSnapshot = {
  instantIso: string;
  from: Location;
  to: Location;
  fromParts: ZoneParts;
  toParts: ZoneParts;
  fromOffset: number;
  toOffset: number;
  hoursAhead: number;
  fromAbbrev: string;
  toAbbrev: string;
  fromDateLabel: string;
  toDateLabel: string;
  table: TableRow[];
  meeting: MeetingWindow | null;
  fromDst: DstInfo;
  toDst: DstInfo;
  yearDiffs: { hours: number; days: number; share: number }[];
  workHourNotes: string[];
};

function workScore(hour: number) {
  if (hour >= 9 && hour < 17) return 1;
  if (hour >= 8 && hour < 9) return 0.6;
  if (hour >= 17 && hour < 18) return 0.6;
  if (hour >= 7 && hour < 8) return 0.3;
  if (hour >= 18 && hour < 19) return 0.3;
  return 0;
}

function bestMeeting(
  from: Location,
  to: Location,
  fromParts: ZoneParts,
): MeetingWindow | null {
  const candidates: { minute: number; score: number; fromH: number; toH: number; toM: number }[] =
    [];
  for (let minute = 0; minute < 24 * 60; minute += 30) {
    const hour = Math.floor(minute / 60);
    const min = minute % 60;
    const resolved = resolveZonedTime(
      from.iana,
      fromParts.year,
      fromParts.month,
      fromParts.day,
      hour,
      min,
    );
    if (resolved.status === "gap") continue;
    const toP = getZoneParts(resolved.instant, to.iana);
    const score = workScore(hour) + workScore(toP.hour);
    if (score >= 0.9) {
      candidates.push({
        minute,
        score,
        fromH: hour,
        toH: toP.hour,
        toM: toP.minute,
      });
    }
  }
  if (candidates.length === 0) return null;
  const best = Math.max(...candidates.map((item) => item.score));
  const top = candidates.filter((item) => item.score === best);
  const start = top[0];
  const end = top[top.length - 1];
  const fromStart = formatClockShort({ hour: start.fromH, minute: start.minute % 60 }, true);
  const endMinute = end.minute + 30;
  const fromEnd = formatClockShort(
    { hour: Math.floor(endMinute / 60) % 24, minute: endMinute % 60 },
    true,
  );
  const toStart = formatClockShort({ hour: start.toH, minute: start.toM }, true);
  const toEndResolved = resolveZonedTime(
    from.iana,
    fromParts.year,
    fromParts.month,
    fromParts.day,
    Math.floor(endMinute / 60) % 24,
    endMinute % 60,
  );
  const toEndParts = getZoneParts(toEndResolved.instant, to.iana);
  const toEnd = formatClockShort(toEndParts, true);
  const startResolved = resolveZonedTime(
    from.iana,
    fromParts.year,
    fromParts.month,
    fromParts.day,
    start.fromH,
    start.minute % 60,
  );
  const toDelta = dayDelta(
    { ...fromParts, hour: start.fromH, minute: start.minute % 60, second: 0 },
    getZoneParts(startResolved.instant, to.iana),
  );
  const extra = dayDeltaLabel(toDelta);
  return {
    fromStart,
    fromEnd,
    toStart,
    toEnd,
    note: `A practical overlap is ${fromStart}–${fromEnd} in ${locationShortPlace(from)}, which is ${toStart}–${toEnd} in ${locationShortPlace(to)}${extra ? ` (${extra})` : ""}.`,
  };
}

export function buildSnapshot(
  from: Location,
  to: Location,
  instant: Date,
  selectedHour?: number,
): ConversionSnapshot {
  const fromParts = getZoneParts(instant, from.iana);
  const toParts = getZoneParts(instant, to.iana);
  const fromOffset = getOffsetMinutes(from.iana, instant);
  const toOffset = getOffsetMinutes(to.iana, instant);
  const hoursAhead = hoursBetweenOffsets(fromOffset, toOffset);
  const fromAbbrev = from.kind === "timezone" && from.abbreviation
    ? zoneAbbreviation(from.iana, instant, from.abbreviation)
    : zoneAbbreviation(from.iana, instant, from.abbreviation);
  const toAbbrev = to.kind === "timezone" && to.abbreviation
    ? zoneAbbreviation(to.iana, instant, to.abbreviation)
    : zoneAbbreviation(to.iana, instant, to.abbreviation);

  const currentHour = selectedHour ?? fromParts.hour;
  const table: TableRow[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    const resolved = resolveZonedTime(
      from.iana,
      fromParts.year,
      fromParts.month,
      fromParts.day,
      hour,
      0,
    );
    if (resolved.status === "gap") {
      table.push({
        fromHour: hour,
        fromLabel12: hourLabel12(hour),
        fromLabel24: hourLabel24(hour),
        toHour: resolved.resolved.hour,
        toMinute: resolved.resolved.minute,
        toLabel12: "does not exist",
        toLabel24: "does not exist",
        dayDelta: 0,
        dayDeltaLabel: "",
        isNow: false,
        isWorkFrom: false,
        isWorkTo: false,
        isNightFrom: isNightHour(hour),
        isNightTo: false,
        status: "gap",
        instantIso: null,
      });
      continue;
    }
    const rowTo = getZoneParts(resolved.instant, to.iana);
    const fromForDelta: ZoneParts = { ...fromParts, hour, minute: 0, second: 0 };
    const delta = dayDelta(fromForDelta, rowTo);
    table.push({
      fromHour: hour,
      fromLabel12: hourLabel12(hour),
      fromLabel24: hourLabel24(hour),
      toHour: rowTo.hour,
      toMinute: rowTo.minute,
      toLabel12: formatClockShort({ hour: rowTo.hour, minute: rowTo.minute }, true),
      toLabel24: formatClockShort({ hour: rowTo.hour, minute: rowTo.minute }, false),
      dayDelta: delta,
      dayDeltaLabel: dayDeltaLabel(delta),
      isNow: hour === currentHour,
      isWorkFrom: isWorkHour(hour),
      isWorkTo: isWorkHour(rowTo.hour),
      isNightFrom: isNightHour(hour),
      isNightTo: isNightHour(rowTo.hour),
      status: resolved.status,
      instantIso: resolved.instant.toISOString(),
    });
  }

  const year = fromParts.year;
  const yearDiffs = yearlyDifferenceShares(from.iana, to.iana, year);
  const workHourNotes = yearDiffs.map((diff) => {
    let sample = new Date(Date.UTC(year, 0, 15, 12));
    for (let day = 0; day < 365; day += 10) {
      const instant = new Date(Date.UTC(year, 0, 1 + day, 12));
      const hours = hoursBetweenOffsets(
        getOffsetMinutes(from.iana, instant),
        getOffsetMinutes(to.iana, instant),
      );
      if (Math.abs(hours - diff.hours) < 0.01) {
        sample = instant;
        break;
      }
    }
    const fromP = getZoneParts(sample, from.iana);
    const nine = getZoneParts(
      resolveZonedTime(from.iana, fromP.year, fromP.month, fromP.day, 9, 0).instant,
      to.iana,
    );
    const five = getZoneParts(
      resolveZonedTime(from.iana, fromP.year, fromP.month, fromP.day, 17, 0).instant,
      to.iana,
    );
    const qualifier = diff.share > 0.6 ? "For most of the year" : "At other times of the year";
    const nineDelta = dayDelta({ ...fromP, hour: 9, minute: 0, second: 0 }, nine);
    const fiveDelta = dayDelta({ ...fromP, hour: 17, minute: 0, second: 0 }, five);
    return `${qualifier}, working hours of 9:00 am to 5:00 pm in ${locationShortPlace(from)} correspond to ${formatClockShort(nine, true)}${dayDeltaLabel(nineDelta) ? ` (${dayDeltaLabel(nineDelta)})` : ""} to ${formatClockShort(five, true)}${dayDeltaLabel(fiveDelta) ? ` (${dayDeltaLabel(fiveDelta)})` : ""} in ${locationShortPlace(to)}.`;
  });

  return {
    instantIso: instant.toISOString(),
    from,
    to,
    fromParts,
    toParts,
    fromOffset,
    toOffset,
    hoursAhead,
    fromAbbrev,
    toAbbrev,
    fromDateLabel: formatDateLong(fromParts),
    toDateLabel: formatDateLong(toParts),
    table,
    meeting: bestMeeting(from, to, fromParts),
    fromDst: getDstInfo(from.iana, instant, year, from.abbreviation),
    toDst: getDstInfo(to.iana, instant, year, to.abbreviation),
    yearDiffs,
    workHourNotes,
  };
}

export function differenceCopy(snapshot: ConversionSnapshot) {
  if (snapshot.hoursAhead === 0) {
    return `${locationFullName(snapshot.from)} and ${locationFullName(snapshot.to)} share the same local time right now.`;
  }
  const phrase = formatHoursPhrase(snapshot.hoursAhead);
  if (snapshot.hoursAhead > 0) {
    return `${locationShortPlace(snapshot.from)} is ${phrase} behind ${locationShortPlace(snapshot.to)}.`;
  }
  return `${locationShortPlace(snapshot.from)} is ${phrase} ahead of ${locationShortPlace(snapshot.to)}.`;
}

export function seasonalDifferenceCopy(snapshot: ConversionSnapshot) {
  if (snapshot.yearDiffs.length <= 1) {
    const hours = snapshot.yearDiffs[0]?.hours ?? snapshot.hoursAhead;
    const relation = hours >= 0 ? "behind" : "ahead of";
    return `${locationShortPlace(snapshot.from)} stays ${formatHoursPhrase(hours)} ${relation} ${locationShortPlace(snapshot.to)} all year.`;
  }
  const [main, other] = snapshot.yearDiffs;
  const phrase = (hours: number) => {
    const span = formatHoursPhrase(hours);
    return hours >= 0 ? `${span} behind` : `${span} ahead of`;
  };
  return `For most of the year, ${locationShortPlace(snapshot.from)} is ${phrase(main.hours)} ${locationShortPlace(snapshot.to)}. At other times of the year, it is ${phrase(other.hours)} ${locationShortPlace(snapshot.to)}.`;
}

export function exampleConversionCopy(snapshot: ConversionSnapshot) {
  const fromTime = formatClockShort(snapshot.fromParts, true);
  const toTime = formatClockShort(snapshot.toParts, true);
  const extra = dayDeltaLabel(dayDelta(snapshot.fromParts, snapshot.toParts));
  return `${fromTime} in ${locationShortPlace(snapshot.from)} is ${toTime}${extra ? ` (${extra})` : ""} in ${locationShortPlace(snapshot.to)}.`;
}

export function pairPath(from: Location, to: Location) {
  return `/converter/${converterSlug(from, to)}`;
}
