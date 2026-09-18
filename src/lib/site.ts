export const SITE_NAME = "Hourbridge";
export const SITE_TAGLINE = "World clock and city-to-city time converter";
export const SITE_DESCRIPTION =
  "Convert local time between cities and time zones. See live clocks, daylight saving changes, meeting overlap, and a 24-hour conversion table.";
export const PRODUCTION_SITE_URL = "https://hourbridge.vercel.app";

const ADSENSE_CLIENT_RE = /^ca-pub-\d{10,20}$/;
const ADSENSE_SLOT_RE = /^\d{6,20}$/;
const GOOGLE_VERIFICATION_RE = /^[\w-]{6,128}$/;

function originFrom(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  return (
    originFrom(process.env.NEXT_PUBLIC_SITE_URL) ||
    originFrom(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    (process.env.VERCEL_ENV === "production" ? PRODUCTION_SITE_URL : null) ||
    originFrom(process.env.VERCEL_URL) ||
    "http://127.0.0.1:43123"
  );
}

export function googleSiteVerification() {
  let raw = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ?? "";
  if (!raw) return "";
  const metaContent = raw.match(/content\s*=\s*["']?([\w-]+)["']?/i);
  if (/<meta/i.test(raw) && metaContent) {
    raw = metaContent[1];
  }
  const prefixed = raw.match(/^google-site-verification=(.+)$/i);
  if (prefixed) raw = prefixed[1].trim();
  raw = raw.replace(/^["']|["']$/g, "").trim();
  return GOOGLE_VERIFICATION_RE.test(raw) ? raw : "";
}

function adsenseClient() {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() ?? "";
  return ADSENSE_CLIENT_RE.test(raw) ? raw : "";
}

function adsenseSlot(value: string | undefined) {
  const raw = value?.trim() ?? "";
  return ADSENSE_SLOT_RE.test(raw) ? raw : "";
}

export const ADSENSE = {
  client: adsenseClient(),
  slots: {
    top: adsenseSlot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP),
    sidebar: adsenseSlot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR),
    inArticle: adsenseSlot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE),
    footer: adsenseSlot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER),
    mobile: adsenseSlot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE),
  },
};
