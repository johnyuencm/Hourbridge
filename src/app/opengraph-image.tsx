import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} time converter`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#fbbf24" }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 16 }}>{SITE_TAGLINE}</div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#ccfbf1" }}>
          Seattle to HKT · live clocks · DST-aware tables
        </div>
      </div>
    ),
    size,
  );
}
