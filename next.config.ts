import type { NextConfig } from "next";

const patterns: Array<{
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
}> = [
  {
    protocol: "http",
    hostname: "localhost",
    port: "1337",
    pathname: "/uploads/**",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "1337",
    pathname: "/uploads/**",
  },
];

try {
  const envUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (envUrl) {
    const u = new URL(envUrl);
    const exists = patterns.some(
      (p) => p.hostname === u.hostname && (p.port || "") === (u.port || ""),
    );
    if (!exists) {
      patterns.push({
        protocol: (u.protocol.replace(":", "") as "http" | "https") || "http",
        hostname: u.hostname,
        port: u.port || undefined,
        pathname: "/uploads/**",
      });
    }
  }
} catch {}

const baseConfig: NextConfig = {
  images: { remotePatterns: patterns },
  // Sentry já lê sentry.*.config.ts
};

let exported: NextConfig | any = baseConfig;

try {
  // Import dinâmico para evitar crash quando pacote não estiver instalado
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { withSentryConfig } = require("@sentry/nextjs");
  const hasDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  exported = hasDsn
    ? withSentryConfig(baseConfig, { silent: true })
    : baseConfig;
} catch {
  exported = baseConfig;
}

export default exported;
