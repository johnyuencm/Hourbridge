import { ImageResponse } from "next/og";
import { parseConverterSlug } from "@/lib/locations";
import { SITE_NAME } from "@/lib/site";

export const alt = "City time converter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pair = parseConverterSlug(slug);
  const from = pair?.from.name ?? "City";
  const to = pair?.to.name ?? "Time zone";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #042f2e 0%, #0f766e 55%, #134e4a 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: "#fbbf24" }}>
          {SITE_NAME} converter
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 20, lineHeight: 1.1 }}>
          {from} → {to}
        </div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#ccfbf1" }}>
          Live clocks, daylight saving, and a 24-hour table
        </div>
      </div>
    ),
    size,
  );
}
