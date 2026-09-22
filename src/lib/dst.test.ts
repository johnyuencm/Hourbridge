/**
 * DST acceptance tests for getDstInfo nextChange + resolveZonedTime gap/fold.
 * Run: npx tsx --test src/lib/dst.test.ts
 */
import assert from "node:assert/strict";
import test from "node:test";
import { buildSnapshot } from "./converter";
import { requireLocation } from "./locations";
import { getDstInfo, getZoneParts, resolveZonedTime, zonedTimeToUtc } from "./time";

const LA = "America/Los_Angeles";

test("getDstInfo nextChange after fall 2026 points at spring 2027 (not null)", () => {
  const afterFall = new Date("2026-11-15T20:00:00.000Z");
  const info = getDstInfo(LA, afterFall, 2026);
  assert.equal(info.usesDst, true);
  assert.ok(info.nextChange, "expected nextChange after fall");
  const at = info.nextChange!.at;
  const local = getZoneParts(at, LA);
  assert.equal(local.year, 2027);
  assert.equal(local.month, 3);
  assert.equal(local.day, 14); // US DST spring 2027-03-14
  // Refined to minute precision around 2am→3am local (10:00Z).
  assert.equal(info.nextChange!.toOffsetMinutes, -420);
  assert.ok(
    Math.abs(at.getTime() - Date.parse("2027-03-14T10:00:00.000Z")) < 60_000,
    `spring transition should be near 10:00Z, got ${at.toISOString()}`,
  );
});

test("getDstInfo nextChange mid-year still finds fall 2026", () => {
  const summer = new Date("2026-07-01T17:00:00.000Z");
  const info = getDstInfo(LA, summer, 2026);
  assert.ok(info.nextChange);
  const local = getZoneParts(info.nextChange!.at, LA);
  assert.equal(local.year, 2026);
  assert.equal(local.month, 11);
  assert.equal(local.day, 1);
  assert.equal(info.nextChange!.toOffsetMinutes, -480);
});

test("spring gap 2026-03-08 02:30 does not silently remap to 01:30", () => {
  const resolved = resolveZonedTime(LA, 2026, 3, 8, 2, 30);
  assert.equal(resolved.status, "gap");
  assert.equal(resolved.resolved.hour, 3);
  assert.equal(resolved.resolved.minute, 0);
  // Must not be the old silent remap (1:30am / 09:30Z).
  assert.notEqual(resolved.instant.toISOString(), "2026-03-08T09:30:00.000Z");
  assert.equal(zonedTimeToUtc(LA, 2026, 3, 8, 2, 30).toISOString(), resolved.instant.toISOString());
});

test("valid times around spring transition still resolve ok", () => {
  const before = resolveZonedTime(LA, 2026, 3, 8, 1, 30);
  assert.equal(before.status, "ok");
  assert.equal(before.instant.toISOString(), "2026-03-08T09:30:00.000Z");

  const after = resolveZonedTime(LA, 2026, 3, 8, 3, 0);
  assert.equal(after.status, "ok");
  assert.equal(after.instant.toISOString(), "2026-03-08T10:00:00.000Z");
});

test("fall fold 2026-11-01 01:30 is ambiguous; earlier occurrence chosen", () => {
  const resolved = resolveZonedTime(LA, 2026, 11, 1, 1, 30);
  assert.equal(resolved.status, "fold");
  assert.equal(resolved.instant.toISOString(), "2026-11-01T08:30:00.000Z");
  assert.ok(resolved.alternate);
  assert.equal(resolved.alternate!.toISOString(), "2026-11-01T09:30:00.000Z");
  const parts = getZoneParts(resolved.instant, LA);
  assert.equal(parts.hour, 1);
  assert.equal(parts.minute, 30);
});

test("non-ambiguous fall-side times remain ok", () => {
  assert.equal(resolveZonedTime(LA, 2026, 11, 1, 0, 30).status, "ok");
  assert.equal(resolveZonedTime(LA, 2026, 11, 1, 2, 30).status, "ok");
});

test("spring-day table does not treat gap 2:00 and 3:00 as the same unique hour", () => {
  const from = requireLocation("wa-seattle");
  const to = requireLocation("hkt");
  const noon = zonedTimeToUtc(LA, 2026, 3, 8, 12, 0);
  const snapshot = buildSnapshot(from, to, noon);

  const two = snapshot.table.find((row) => row.fromHour === 2);
  const three = snapshot.table.find((row) => row.fromHour === 3);
  assert.ok(two, "expected 2:00 row");
  assert.ok(three, "expected 3:00 row");
  assert.equal(two.status, "gap");
  assert.equal(two.instantIso, null);
  assert.equal(two.toLabel24, "does not exist");
  assert.equal(three.status, "ok");
  assert.equal(three.instantIso, "2026-03-08T10:00:00.000Z");
  assert.notEqual(two.toLabel24, three.toLabel24);

  const mapped = snapshot.table.filter((row) => row.status !== "gap");
  const instants = mapped.map((row) => row.instantIso);
  assert.ok(instants.every((iso) => iso != null));
  assert.equal(new Set(instants).size, instants.length, "mapped local hours must have unique UTC instants");
  assert.equal(mapped.length, 23);
});

test("ordinary day table maps 24 unique local hours", () => {
  const from = requireLocation("wa-seattle");
  const to = requireLocation("hkt");
  const noon = zonedTimeToUtc(LA, 2026, 6, 15, 12, 0);
  const snapshot = buildSnapshot(from, to, noon);
  assert.ok(snapshot.table.every((row) => row.status === "ok"));
  const instants = snapshot.table.map((row) => row.instantIso);
  assert.equal(new Set(instants).size, 24);
});

test("bestMeeting on spring-forward day skips the gap hour", () => {
  const from = requireLocation("wa-seattle");
  const to = requireLocation("hkt");
  const noon = zonedTimeToUtc(LA, 2026, 3, 8, 12, 0);
  const snapshot = buildSnapshot(from, to, noon);
  assert.ok(snapshot.meeting);
  assert.notEqual(snapshot.meeting.fromStart, "2:00 am");
  assert.equal(snapshot.meeting.note.includes("2:00 am–"), false);
});
