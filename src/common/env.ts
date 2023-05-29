export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  THROTTLER_TTL: parseInt(process.env.THROTTLER_TTL ?? "60", 10),
  THROTTLER_REQ_PER_TTL: parseInt(
    process.env.THROTTLER_REQ_PER_TTL ?? "120",
    10
  ),
  GOOGLE_ANALYTICS_TAG: process.env.GOOGLE_ANALYTICS_TAG,
});
