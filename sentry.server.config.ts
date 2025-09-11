import * as Sentry from "@sentry/nextjs";

const DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: DSN,
  enabled: Boolean(DSN),
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
});
