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
  DIREKTNO = "direktno",
  POSLOVNI = "poslovni",
  DANAS = "danas",
  ZAGREB = "zagreb",
  TELEGRAM = "telegram",
  NOVI_LIST = "novilist",
  N1_INFO = "n1info",
  NACIONAL = "nacional",
  NACIONALNO = "nacionalno",
  OTVORENO = "otvoreno",
}

export enum CommonConstants {
  LISTEN_PORT = 3000,
  TRUE_STRING = "true",
  UTF_8 = "utf-8",
  TEXT_HTML = "text/html",
  HOME_NAME = "Početna",
  HOME_ICON = "https://cdn-icons-png.flaticon.com/128/553/553376.png",
  PROD_ENV = "production",
  STATS = `Članci: <strong>@num@</strong> | Obrada: <strong>@duration@</strong>  | Osvježeno: <strong>@date@</strong>`,
  NO_STATS = "Statistika nedostupna.",
  ACTIVE_ITEM = "active ",
}

export enum SwaggerConstants {
  TITLE = "API Docs",
  DESCRIPTION = "The appropriate API documentation",
  VERSION = "1.0.0",
  URL = "docs",
}

export enum Tokens {
  REDIRECT_URL = "@redurl@",
  NUMBER = "@num@",
  DURATION = "@duration@",
  DATE = "@date@",
  PORTAL = "@portal@",
  NAME = "@name@",
  LINK = "@link@",
  ACTIVE = "@active@",
  GOOGLE_TAG_ID = "@gtid@",
}

export enum ControllerTags {
  PORTALS = "portals",
  API = "api",
}

export enum Params {
  PORTAL = "portal",
  ARTICLE_ID = "articleId",
  WITH_CONTENT = "withContent",
}

export enum TemplateNames {
  HOME = "home.html",
  ARTICLE = "article.html",
  PORTAL = "portal.html",
  ITEM = "item.html",
  GTAG = "gtag.html",
  NO_ARTICLES = "empty.html",
  LINK = "link.html",
  REDIRECT = "redirect.html",
}

export enum StatsKeys {
  LAST_REFRESHED_ON_PREFIX = "last_refreshed_on_",
  TOTAL_SCRAPING_TIME_PREFIX = "total_scraping_time_",
  TOTAL_SCRAPED_ARTICLES_PREFIX = "total_scraped_articles_",
  PAGE_SUFFIX = "page",
}
