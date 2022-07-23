export enum CommonConstants {
  LISTEN_PORT = 3000,
  TRUE_STRING = "true",
  PRODUCTION_MODE = "production",
  UTF_8 = "utf-8",
  TEXT_HTML = "text/html",
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

export enum PinoMode {
  LOCAL = "local",
  ELASTIC = "elastic",
}

export enum ControllerTags {
  PORTALS = "portals",
}

export enum UrlParams {
  PORTAL = "portal",
}

export enum QueryParams {}

export enum TemplateNames {
  HOME = "home.html",
  ARTICLE = "article.html",
  PORTAL = "portal.html",
  ITEM = "item.html",
}

export enum Portals {
  HOME = "home",
  SATA24 = "24sata",
  INDEX = "index",
  VECERNJI = "vecernji",
  JUTARNJI = "jutarnji",
  NET = "net",
  DNEVNIK = "dnevnik",
  DNEVNO = "dnevno",
  TPORTAL = "tportal",
  SLOBODNA_DALMACIJA = "sd",
  SPORTSKE_NOVOSTI = "sn",
}
