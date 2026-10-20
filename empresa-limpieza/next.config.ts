import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Port de los headers de seguridad del vercel.json original.
// La CSP solo se aplica en producción: en dev Turbopack/HMR necesita 'unsafe-eval'.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=()" },
  { key: "X-Frame-Options", value: "DENY" },
  ...(isProd
    ? [
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
