import type { NextConfig } from "next";

const patterns: Array<{
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
}> = [
  { protocol: "http", hostname: "localhost", port: "1337", pathname: "/uploads/**" },
  { protocol: "http", hostname: "127.0.0.1", port: "1337", pathname: "/uploads/**" },
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

const nextConfig: NextConfig = {
  images: {
    remotePatterns: patterns,
  },
};

export default nextConfig;
