import { ADSENSE } from "@/lib/site";

export function GET() {
  const client = ADSENSE.client;
  if (!client) {
    return new Response(
      "# Set NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-xxxxxxxx) to publish ads.txt\n",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }
  const pub = client.slice("ca-".length);
  return new Response(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
