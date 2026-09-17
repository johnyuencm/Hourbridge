"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { locationFullName, searchLocations, type Location } from "@/lib/locations";
import { cn } from "@/lib/utils";

export function LocationSearch({
  onSelect,
  placeholder = "Search a city or time zone",
  autoFocus = false,
  className,
}: {
  onSelect: (location: Location) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchLocations(query), [query]);

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 bg-white pl-9"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 180);
        }}
      />
      {open ? (
        <ul className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border bg-white py-1 shadow-lg">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No matching city or zone</li>
          ) : (
            results.map((location) => (
              <li key={location.slug}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-teal-50"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelect(location);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <span className="text-sm font-medium">{location.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {locationFullName(location)} · {location.iana}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

export function PairSearch({
  initialFrom,
  initialTo,
}: {
  initialFrom?: Location;
  initialTo?: Location;
}) {
  const router = useRouter();
  const [from, setFrom] = useState<Location | undefined>(initialFrom);
  const [to, setTo] = useState<Location | undefined>(initialTo);
  const [picking, setPicking] = useState<"from" | "to" | null>(null);

  function go(nextFrom = from, nextTo = to) {
    if (nextFrom && nextTo && nextFrom.slug !== nextTo.slug) {
      router.push(`/converter/${nextFrom.slug}-to-${nextTo.slug}`);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto] md:items-end">
        <label className="grid gap-1.5 text-sm font-medium">
          From
          {picking === "from" || !from ? (
            <LocationSearch
              autoFocus={picking === "from"}
              placeholder="Seattle, Pacific Time, UTC…"
              onSelect={(location) => {
                setFrom(location);
                setPicking(null);
              }}
            />
          ) : (
            <button
              type="button"
              className="h-11 rounded-lg border bg-stone-50 px-3 text-left text-sm font-normal hover:border-teal-700"
              onClick={() => setPicking("from")}
            >
              {locationFullName(from)}
            </button>
          )}
        </label>
        <Button
          type="button"
          variant="outline"
          className="md:mb-0.5"
          onClick={() => {
            setFrom(to);
            setTo(from);
            if (to && from) router.push(`/converter/${to.slug}-to-${from.slug}`);
          }}
        >
          Swap
        </Button>
        <label className="grid gap-1.5 text-sm font-medium">
          To
          {picking === "to" || !to ? (
            <LocationSearch
              autoFocus={picking === "to"}
              placeholder="Hong Kong Time, London…"
              onSelect={(location) => {
                setTo(location);
                setPicking(null);
              }}
            />
          ) : (
            <button
              type="button"
              className="h-11 rounded-lg border bg-stone-50 px-3 text-left text-sm font-normal hover:border-teal-700"
              onClick={() => setPicking("to")}
            >
              {locationFullName(to)}
            </button>
          )}
        </label>
        <Button type="button" className="h-11 bg-teal-800 hover:bg-teal-900" onClick={() => go()}>
          Convert
        </Button>
      </div>
    </div>
  );
}
