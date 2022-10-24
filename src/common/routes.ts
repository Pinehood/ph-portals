export enum PortalsRoutes {
  ROOT = "/",
  PORTAL = "/portals/:portal",
  ARTICLE = "/portals/article/:portal/:articleId",
}

export enum ApiRoutes {
  PORTALS = "/api/portals",
  ARTICLES = "/api/articles/:portal",
  STATS = "/api/stats",
  PORTAL_STATS = "/api/stats/:portal",
}
