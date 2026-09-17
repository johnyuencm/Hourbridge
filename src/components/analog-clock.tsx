import { cn } from "@/lib/utils";
import type { ZoneParts } from "@/lib/time";

function isNight(hour: number) {
  return hour >= 19 || hour < 6;
}

export function AnalogClock({
  parts,
  className,
}: {
  parts: ZoneParts;
  className?: string;
}) {
  const hourAngle = ((parts.hour % 12) + parts.minute / 60) * 30;
  const minuteAngle = parts.minute * 6 + parts.second * 0.1;
  const secondAngle = parts.second * 6;
  const night = isNight(parts.hour);

  return (
    <div
      className={cn(
        "relative aspect-square w-36 rounded-full border-[6px] shadow-inner",
        night
          ? "border-slate-700 bg-[radial-gradient(circle_at_50%_30%,#334155, #0f172a)]"
          : "border-teal-800/20 bg-[radial-gradient(circle_at_50%_30%,#ffffff,#e8f4f2)]",
        className,
      )}
      aria-hidden="true"
    >
      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, index) => {
        const angle = index * 30;
        const isCardinal = n % 3 === 0;
        const radius = isCardinal ? 38 : 42;
        const x = 50 + radius * Math.sin((angle * Math.PI) / 180);
        const y = 50 - radius * Math.cos((angle * Math.PI) / 180);
        return (
          <span
            key={n}
            className={cn(
              "absolute",
              isCardinal
                ? night
                  ? "text-[11px] font-semibold text-slate-100"
                  : "text-[11px] font-semibold text-teal-950"
                : night
                  ? "h-1.5 w-0.5 bg-slate-400"
                  : "h-1.5 w-0.5 bg-teal-800/50",
            )}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: isCardinal
                ? "translate(-50%, -50%)"
                : `translate(-50%, -50%) rotate(${angle}deg)`,
            }}
          >
            {isCardinal ? n : null}
          </span>
        );
      })}
      <Hand angle={hourAngle} length={34} className={cn("w-[3px]", night ? "bg-amber-200" : "bg-teal-950")} />
      <Hand angle={minuteAngle} length={48} className={cn("w-[2px]", night ? "bg-slate-100" : "bg-teal-800")} />
      <Hand angle={secondAngle} length={52} className="w-px bg-rose-500" />
      <span
        className={cn(
          "absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
          night ? "bg-amber-200" : "bg-teal-950",
        )}
      />
    </div>
  );
}

function Hand({
  angle,
  length,
  className,
}: {
  angle: number;
  length: number;
  className?: string;
}) {
  return (
    <span
      className={cn("absolute left-1/2 rounded-full", className)}
      style={{
        height: length,
        bottom: "50%",
        transformOrigin: "bottom center",
        transform: `translateX(-50%) rotate(${angle}deg)`,
      }}
    />
  );
}
