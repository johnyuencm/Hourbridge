export type ZoneParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getZoneParts(date: Date, timeZone: string): ZoneParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const map: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  let hour = Number(map.hour);
  let day = Number(map.day);
  let month = Number(map.month);
  let year = Number(map.year);
  if (hour === 24) {
    hour = 0;
    const next = new Date(Date.UTC(year, month - 1, day + 1));
    year = next.getUTCFullYear();
    month = next.getUTCMonth() + 1;
    day = next.getUTCDate();
  }
  return {
    year,
    month,
    day,
    hour,
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: map.weekday,
  };
}

export function getOffsetMinutes(timeZone: string, date: Date) {
  const parts = getZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return Math.round((asUtc - date.getTime()) / 60_000);
}

export type ZonedTimeStatus = "ok" | "gap" | "fold";

export type ZonedTimeResolution = {
  /** Chosen UTC instant (gap: clamped forward; fold: earlier occurrence). */
  instant: Date;
  status: ZonedTimeStatus;
  /** Wall-clock parts of `instant` in the zone. */
  resolved: ZoneParts;
  /** For fold: the later occurrence of the same local wall time. */
  alternate?: Date;
};

function wallClockMatches(
  date: Date,
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
) {
  const parts = getZoneParts(date, timeZone);
  return (
    parts.year === year &&
    parts.month === month &&
    parts.day === day &&
    parts.hour === hour &&
    parts.minute === minute &&
    parts.second === second
  );
}

function collectNearbyOffsets(timeZone: string, utcGuessMs: number) {
  const offsets = new Set<number>();
  for (const deltaHours of [-36, -24, -12, -2, 0, 2, 12, 24, 36]) {
    offsets.add(getOffsetMinutes(timeZone, new Date(utcGuessMs + deltaHours * 3_600_000)));
  }
  return offsets;
}

function exactZonedMatches(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const matches: Date[] = [];
  for (const offset of collectNearbyOffsets(timeZone, utcGuess)) {
    const candidate = new Date(utcGuess - offset * 60_000);
    if (
      wallClockMatches(candidate, timeZone, year, month, day, hour, minute, second) &&
      !matches.some((m) => m.getTime() === candidate.getTime())
    ) {
      matches.push(candidate);
    }
  }
  matches.sort((a, b) => a.getTime() - b.getTime());
  return matches;
}

/**
 * Resolve a local civil time in `timeZone` to UTC.
 * - ok: unique mapping
 * - gap: local time skipped by spring-forward; clamps forward to the next valid minute
 * - fold: local time repeated by fall-back; picks the earlier occurrence (`alternate` is later)
 */
export function resolveZonedTime(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
): ZonedTimeResolution {
  const matches = exactZonedMatches(timeZone, year, month, day, hour, minute, second);
  if (matches.length >= 2) {
    return {
      instant: matches[0],
      status: "fold",
      resolved: getZoneParts(matches[0], timeZone),
      alternate: matches[matches.length - 1],
    };
  }
  if (matches.length === 1) {
    return {
      instant: matches[0],
      status: "ok",
      resolved: getZoneParts(matches[0], timeZone),
    };
  }

  // Spring gap (or other nonexistent local time): walk local clock forward up to 3h.
  for (let addMinutes = 1; addMinutes <= 180; addMinutes += 1) {
    const probe = new Date(Date.UTC(year, month - 1, day, hour, minute + addMinutes, second));
    const ly = probe.getUTCFullYear();
    const lm = probe.getUTCMonth() + 1;
    const ld = probe.getUTCDate();
    const lh = probe.getUTCHours();
    const lmin = probe.getUTCMinutes();
    const ls = probe.getUTCSeconds();
    const found = exactZonedMatches(timeZone, ly, lm, ld, lh, lmin, ls);
    if (found.length > 0) {
      return {
        instant: found[0],
        status: "gap",
        resolved: getZoneParts(found[0], timeZone),
      };
    }
  }

  // Last resort: legacy single-offset adjust (should be unreachable for real IANA zones).
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset1 = getOffsetMinutes(timeZone, new Date(utcGuess));
  const adjusted = new Date(utcGuess - offset1 * 60_000);
  const offset2 = getOffsetMinutes(timeZone, adjusted);
  const instant = offset2 === offset1 ? adjusted : new Date(utcGuess - offset2 * 60_000);
  return {
    instant,
    status: "gap",
    resolved: getZoneParts(instant, timeZone),
  };
}

/** UTC instant for a local wall time. Gaps clamp forward; folds use the earlier occurrence. */
export function zonedTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
) {
  return resolveZonedTime(timeZone, year, month, day, hour, minute, second).instant;
}

export function formatOffset(offsetMinutes: number) {
  const rounded = Math.round(offsetMinutes);
  const sign = rounded >= 0 ? "+" : "−";
  const abs = Math.abs(rounded);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return minutes === 0 ? `UTC${sign}${hours}` : `UTC${sign}${hours}:${pad(minutes)}`;
}

export function zoneAbbreviation(timeZone: string, date: Date, fallback?: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
    hour: "numeric",
  });
  const name = fmt.formatToParts(date).find((part) => part.type === "timeZoneName")?.value;
  if (name && !/^GMT|^UTC/.test(name)) return name;
  if (fallback) return fallback;
  return formatOffset(getOffsetMinutes(timeZone, date));
}

export function zoneLongName(timeZone: string, date: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "long",
    hour: "numeric",
  });
  return fmt.formatToParts(date).find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

export function formatClock(parts: ZoneParts, hour12: boolean) {
  if (!hour12) {
    return `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
  }
  const hour = parts.hour % 12 || 12;
  const suffix = parts.hour < 12 ? "am" : "pm";
  return `${hour}:${pad(parts.minute)}:${pad(parts.second)} ${suffix}`;
}

export function formatClockShort(parts: Pick<ZoneParts, "hour" | "minute">, hour12: boolean) {
  if (!hour12) return `${pad(parts.hour)}:${pad(parts.minute)}`;
  const hour = parts.hour % 12 || 12;
  const suffix = parts.hour < 12 ? "am" : "pm";
  return `${hour}:${pad(parts.minute)} ${suffix}`;
}

export function hourLabel12(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  if (normalized === 0) return "12am (midnight)";
  if (normalized === 12) return "12pm (noon)";
  if (normalized < 12) return `${normalized}am`;
  return `${normalized - 12}pm`;
}

export function hourLabel24(hour: number) {
  return `${pad(((hour % 24) + 24) % 24)}:00`;
}

export function formatDateLong(parts: ZoneParts) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const month = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(date);
  return `${parts.weekday}, ${month} ${parts.day}, ${parts.year}`;
}

export function formatDateShort(parts: ZoneParts) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(date);
  return `${month} ${parts.day}, ${parts.year}`;
}

export function dayDelta(from: ZoneParts, to: ZoneParts) {
  const start = Date.UTC(from.year, from.month - 1, from.day);
  const end = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((end - start) / 86_400_000);
}

export function dayDeltaLabel(delta: number) {
  if (delta === 0) return "";
  if (delta === 1) return "next day";
  if (delta === -1) return "previous day";
  if (delta > 1) return `${delta} days later`;
  return `${Math.abs(delta)} days earlier`;
}

export function hoursBetweenOffsets(fromOffsetMinutes: number, toOffsetMinutes: number) {
  // Keep fractional hours (e.g. Asia/Kolkata +05:30 → 5.5). Offsets are integer minutes.
  return (toOffsetMinutes - fromOffsetMinutes) / 60;
}

/** Pretty-print a signed hour delta for copy ("5.5 hours", "1 hour"). */
export function formatHoursPhrase(hours: number) {
  const abs = Math.abs(hours);
  const normalized = Math.round(abs * 60) / 60;
  const label = Number.isInteger(normalized) ? String(normalized) : String(normalized);
  return `${label} ${normalized === 1 ? "hour" : "hours"}`;
}

export type DstInfo = {
  usesDst: boolean;
  inDst: boolean;
  offsetMinutes: number;
  standardOffsetMinutes: number;
  daylightOffsetMinutes: number;
  abbreviation: string;
  longName: string;
  nextChange: { at: Date; toOffsetMinutes: number } | null;
};

const dstInfoCache = new Map<string, DstInfo>();
const yearDiffCache = new Map<string, { hours: number; days: number; share: number }[]>();

function remember<T>(cache: Map<string, T>, key: string, value: T, max = 512) {
  if (cache.size >= max) cache.clear();
  cache.set(key, value);
  return value;
}

/** Scan forward ~400 days from `from` for the next UTC-offset change; refine to ~1 minute. */
function findNextOffsetChange(
  timeZone: string,
  from: Date,
): { at: Date; toOffsetMinutes: number } | null {
  const startMs = from.getTime();
  if (Number.isNaN(startMs)) return null;
  const endMs = startMs + 400 * 86_400_000;
  let prev = getOffsetMinutes(timeZone, from);
  let windowStart = startMs;
  let windowEnd: number | null = null;

  // Coarse hourly scan from the instant (covers year boundary into year+1).
  for (let t = startMs + 3_600_000; t <= endMs; t += 3_600_000) {
    const current = getOffsetMinutes(timeZone, new Date(t));
    if (current !== prev) {
      windowEnd = t;
      break;
    }
    windowStart = t;
    prev = current;
  }
  if (windowEnd == null) return null;

  const baseOffset = getOffsetMinutes(timeZone, new Date(windowStart));
  let lo = windowStart;
  let hi = windowEnd;
  while (hi - lo > 60_000) {
    const mid = Math.floor((lo + hi) / 2);
    if (getOffsetMinutes(timeZone, new Date(mid)) === baseOffset) lo = mid;
    else hi = mid;
  }
  for (let t = lo; t <= hi; t += 60_000) {
    const offset = getOffsetMinutes(timeZone, new Date(t));
    if (offset !== baseOffset) {
      return { at: new Date(t), toOffsetMinutes: offset };
    }
  }
  return { at: new Date(hi), toOffsetMinutes: getOffsetMinutes(timeZone, new Date(hi)) };
}

export function getDstInfo(
  timeZone: string,
  date: Date,
  year = date.getUTCFullYear(),
  fallbackAbbrev?: string,
): DstInfo {
  const instant = Number.isNaN(date.getTime()) ? new Date() : date;
  const cacheKey = `${timeZone}|${year}|${instant.toISOString().slice(0, 13)}|${fallbackAbbrev ?? ""}`;
  const cached = dstInfoCache.get(cacheKey);
  if (cached) return cached;

  const samples: number[] = [];
  for (let month = 0; month < 12; month += 1) {
    samples.push(getOffsetMinutes(timeZone, new Date(Date.UTC(year, month, 15, 12))));
  }
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const usesDst = min !== max;
  const offsetMinutes = getOffsetMinutes(timeZone, instant);
  const inDst = usesDst && offsetMinutes === max;
  let nextChange: DstInfo["nextChange"] = null;
  if (usesDst) {
    nextChange = findNextOffsetChange(timeZone, instant);
  }
  return remember(dstInfoCache, cacheKey, {
    usesDst,
    inDst,
    offsetMinutes,
    standardOffsetMinutes: min,
    daylightOffsetMinutes: max,
    abbreviation: zoneAbbreviation(timeZone, instant, fallbackAbbrev),
    longName: zoneLongName(timeZone, instant),
    nextChange,
  });
}

export type DiffShare = { hours: number; days: number };

export function yearlyDifferenceShares(fromTz: string, toTz: string, year: number) {
  const boundedYear = Math.min(2100, Math.max(1970, Math.trunc(year) || new Date().getUTCFullYear()));
  const cacheKey = `${fromTz}|${toTz}|${boundedYear}`;
  const cached = yearDiffCache.get(cacheKey);
  if (cached) return cached;

  const counts = new Map<number, number>();
  for (let day = 0; day < 366; day += 1) {
    const instant = new Date(Date.UTC(boundedYear, 0, 1 + day, 12));
    if (instant.getUTCFullYear() !== boundedYear) break;
    const hours = hoursBetweenOffsets(
      getOffsetMinutes(fromTz, instant),
      getOffsetMinutes(toTz, instant),
    );
    counts.set(hours, (counts.get(hours) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  return remember(
    yearDiffCache,
    cacheKey,
    [...counts.entries()]
      .map(([hours, days]) => ({ hours, days, share: days / total }))
      .sort((a, b) => b.share - a.share),
  );
}

export function isWorkHour(hour: number) {
  return hour >= 9 && hour < 17;
}

export function isNightHour(hour: number) {
  return hour >= 22 || hour < 6;
}

export function parseDateInput(value?: string | null) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1970 || year > 2100) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const utc = Date.UTC(year, month - 1, day);
  const valid = new Date(utc);
  if (valid.getUTCFullYear() !== year || valid.getUTCMonth() !== month - 1 || valid.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

export function parseTimeInput(value?: string | null) {
  if (!value) return { hour: 0, minute: 0 };
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return { hour: 0, minute: 0 };
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return { hour: 0, minute: 0 };
  return { hour, minute };
}

export function toDateInput(parts: ZoneParts) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function toTimeInput(parts: ZoneParts) {
  return `${pad(parts.hour)}:${pad(parts.minute)}`;
}
