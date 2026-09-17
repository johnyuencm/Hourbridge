import type { MetadataRoute } from "next";
import { getStaticConverterSlugs, LOCATIONS } from "@/lib/locations";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${site}/converter`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${site}/time`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site}/time-zones`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];
  const converters: MetadataRoute.Sitemap = getStaticConverterSlugs().map((slug) => ({
    url: `${site}/converter/${slug}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: slug === "wa-seattle-to-hkt" ? 0.95 : 0.7,
  }));
  const cities: MetadataRoute.Sitemap = LOCATIONS.map((location) => ({
    url: `${site}/time/${location.slug}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.65,
  }));
  return [...staticRoutes, ...converters, ...cities];
}
