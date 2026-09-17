"use client";

import { useEffect, useRef } from "react";
import { ADSENSE } from "@/lib/site";
import { cn } from "@/lib/utils";

type Placement = "top" | "sidebar" | "inArticle" | "footer" | "mobile";

const SIZE: Record<
  Placement,
  { className: string; label: string; width: number; height: number }
> = {
  top: {
    className: "min-h-[90px] w-full max-w-[728px]",
    label: "728 × 90 leaderboard",
    width: 728,
    height: 90,
  },
  sidebar: {
    className: "min-h-[250px] w-full max-w-[300px]",
    label: "300 × 250 rectangle",
    width: 300,
    height: 250,
  },
  inArticle: {
    className: "min-h-[90px] w-full max-w-[728px]",
    label: "728 × 90 in-article",
    width: 728,
    height: 90,
  },
  footer: {
    className: "min-h-[90px] w-full max-w-[728px]",
    label: "728 × 90 footer",
    width: 728,
    height: 90,
  },
  mobile: {
    className: "min-h-[100px] w-full max-w-[320px]",
    label: "320 × 100 mobile banner",
    width: 320,
    height: 100,
  },
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  placement,
  className,
}: {
  placement: Placement;
  className?: string;
}) {
  const slot = ADSENSE.slots[placement];
  const size = SIZE[placement];
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE.client || !slot || pushed.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // Ad blockers should not break the converter.
    }
  }, [slot]);

  return (
    <aside
      aria-label="Advertisement"
      className={cn("mx-auto flex flex-col items-center gap-1", className)}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Advertisement
      </p>
      {ADSENSE.client && slot ? (
        <ins
          className={cn("adsbygoogle block overflow-hidden bg-muted/40", size.className)}
          style={{ display: "block", minWidth: size.width, minHeight: size.height }}
          data-ad-client={ADSENSE.client}
          data-ad-slot={slot}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-md border border-dashed border-teal-800/20 bg-teal-50/60 text-center text-xs text-teal-900/70",
            size.className,
          )}
        >
          Google Ad slot
          <span className="hidden sm:inline">
            {" "}
            · {size.label}
          </span>
        </div>
      )}
    </aside>
  );
}
