export enum CommonConstants {
  TRUE_STRING = "true",
  PRODUCTION_MODE = "production",
}

export enum NumberConstants {
  LISTEN_PORT = 3000,
}

export enum SwaggerConstants {
  TITLE = "API Docs",
  DESCRIPTION = "The appropriate API documentation",
  VERSION = "1.0.0",
  URL = "api",
}

export enum ElasticConstants {
  DEFAULT_CONSISTENCY = "one",
  TEMPLATE_VERSION = 7,
  FLUSH_BYTES = 1024,
}

export enum CloudWatchConstants {
  GROUP = "on-oman",
  INTERVAL_MS = 10000,
}

export enum PinoMode {
  LOCAL = "local",
  ELASTIC = "elastic",
  MULTI = "multi",
}

export enum ControllerTags {
  PORTALS = "portals",
}
