/* eslint-disable */
export default async () => {
    const t = {
        ["./dtos/portal.dto"]: await import("./dtos/portal.dto"),
        ["./dtos/article-info.dto"]: await import("./dtos/article-info.dto"),
        ["./dtos/scraper-stats.dto"]: await import("./dtos/scraper-stats.dto")
    };
    return { "@nestjs/swagger": { "models": [[import("./dtos/article-info.dto"), { "ArticleInfo": { portalName: { required: true, type: () => String }, portalLink: { required: true, type: () => String }, articleId: { required: true, type: () => String }, articleLink: { required: true, type: () => String }, title: { required: true, type: () => String }, lead: { required: true, type: () => String }, content: { required: true, type: () => String }, author: { required: true, type: () => String }, time: { required: true, type: () => String } } }], [import("./dtos/article.dto"), { "Article": { portalType: { required: true, type: () => String }, backLink: { required: true, type: () => String }, html: { required: true, type: () => String } } }], [import("./dtos/portal.dto"), { "Portal": { name: { required: true, type: () => String }, value: { required: true, type: () => String } } }], [import("./dtos/scraper-stats.dto"), { "ScraperStats": { duration: { required: true, type: () => Number }, articles: { required: true, type: () => Number }, date: { required: true, type: () => Number } } }]], "controllers": [[import("./controllers/api.controller"), { "ApiController": { "getPortals": { type: [t["./dtos/portal.dto"].Portal] }, "getArticles": { type: [t["./dtos/article-info.dto"].ArticleInfo] }, "getTotalStats": { type: t["./dtos/scraper-stats.dto"].ScraperStats }, "getPortalStats": { type: t["./dtos/scraper-stats.dto"].ScraperStats } } }], [import("./controllers/portals.controller"), { "PortalsController": { "getHome": { type: String }, "getPage": { type: String }, "getArticle": { type: String } } }]] } };
};