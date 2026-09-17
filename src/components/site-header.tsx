"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SITE_NAME } from "@/lib/site";

const NAV = [
  { href: "/converter", label: "Converter" },
  { href: "/time", label: "World clock" },
  { href: "/time-zones", label: "Time zones" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="bg-teal-950 text-teal-50">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-md bg-amber-400 text-teal-950">
            H
          </span>
          <span>{SITE_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-teal-100 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-teal-900 md:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-teal-950 text-teal-50">
            <SheetHeader>
              <SheetTitle className="text-teal-50">{SITE_NAME}</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-3 px-4">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-lg">
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
