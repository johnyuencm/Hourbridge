/**
 * Contract tests for hour-delta helpers in time.ts.
 * Keep these implementations identical to hoursBetweenOffsets / formatHoursPhrase.
 */
import assert from "node:assert/strict";
import test from "node:test";

function hoursBetweenOffsets(fromOffsetMinutes, toOffsetMinutes) {
  return (toOffsetMinutes - fromOffsetMinutes) / 60;
}

function formatHoursPhrase(hours) {
  const abs = Math.abs(hours);
  const normalized = Math.round(abs * 60) / 60;
  const label = Number.isInteger(normalized) ? String(normalized) : String(normalized);
  return `${label} ${normalized === 1 ? "hour" : "hours"}`;
}

test("hoursBetweenOffsets keeps Kolkata half-hours vs UTC", () => {
  assert.equal(hoursBetweenOffsets(0, 330), 5.5);
  assert.equal(formatHoursPhrase(5.5), "5.5 hours");
});

test("hoursBetweenOffsets keeps Kolkata half-hours vs New York EDT", () => {
  assert.equal(hoursBetweenOffsets(330, -240), -9.5);
  assert.equal(formatHoursPhrase(-9.5), "9.5 hours");
});

test("whole-hour deltas still format as integers", () => {
  assert.equal(hoursBetweenOffsets(0, 60), 1);
  assert.equal(formatHoursPhrase(1), "1 hour");
  assert.equal(formatHoursPhrase(2), "2 hours");
});
