import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.google.com https://www.gstatic.com https://www.googletagservices.com https://partner.googleadservices.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://adservice.google.com https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com https://www.googleadservices.com https://partner.googleadservices.com https://adservice.google.com https://csi.gstatic.com https://ep1.adtrafficquality.google https://fundingchoicesmessages.google.com",
      "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://google.com https://pagead2.googlesyndication.com https://www.googleadservices.com https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
