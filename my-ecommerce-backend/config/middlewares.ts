export default [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "http:", "https:"],
          "img-src": ["'self'", "data:", "blob:", "http:", "https:"],
          "media-src": ["'self'", "data:", "blob:", "http:", "https:"],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      origin: (process.env.CORS_ORIGINS || "http://localhost:3000")
        .split(",")
        .map((o) => o.trim()),
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      headers: "*",
      keepHeaderOnError: true,
    },
  },
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  // Favicon é obrigatório no v5. Aqui aponto para o arquivo na RAIZ.
  { name: "strapi::favicon", config: { path: "favicon.ico" } },
  "strapi::public",
];
