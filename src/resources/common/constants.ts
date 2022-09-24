export enum CommonConstants {
  LISTEN_PORT = 3000,
  TRUE_STRING = "true",
  PRODUCTION_MODE = "production",
  UTF_8 = "utf-8",
  TEXT_HTML = "text/html",
  APPLICATION_JSON = "application/json",
}

export enum SwaggerConstants {
  TITLE = "API Docs",
  DESCRIPTION = "The appropriate API documentation",
  VERSION = "1.0.0",
  URL = "docs",
}

export enum ElasticConstants {
  DEFAULT_CONSISTENCY = "one",
  TEMPLATE_VERSION = 7,
  FLUSH_BYTES = 1024,
}

export enum ResponseConstants {
  REDIRECT = '<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=@redurl@"/></head><body></body></html>',
  NO_ARTICLES = '<h4 style="text-align: center">Nema članaka za prikaz.</h4>',
  NO_STATS = "Statistika nedostupna.",
}

export enum PinoMode {
  LOCAL = "local",
  ELASTIC = "elastic",
}

export enum ControllerTags {
  PORTALS = "portals",
  API = "api",
}

export enum UrlParams {
  PORTAL = "portal",
  ARTICLE_ID = "articleId",
}

export enum QueryParams {
  WITH_CONTENT = "withContent",
}

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

export enum RedisStatsKeys {
  LAST_REFRESHED_ON_PREFIX = "last_refreshed_on_",
  TOTAL_SCRAPING_TIME_PREFIX = "total_scraping_time_",
  TOTAL_SCRAPED_ARTICLES_PREFIX = "total_scraped_articles_",
}
