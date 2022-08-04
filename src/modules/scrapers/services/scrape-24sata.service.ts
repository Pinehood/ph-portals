import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import axios from "axios";
import { Article, Portals, PortalsRoutes } from "@modules/common";
import { ScraperService } from "@scrapers/services/scraper.service";
import * as cheerio from "cheerio";

@Injectable()
export class Scrape24SataService implements ScraperService {
  rootLinks: string[];
  name: string;
  link: string;

  constructor(
    @InjectPinoLogger(Scrape24SataService.name)
    private readonly logger: PinoLogger
  ) {
    this.name = "24sata";
    this.link = "https://www.24sata.hr";
    this.rootLinks = [
      "https://www.24sata.hr/feeds/aktualno.xml",
      "https://www.24sata.hr/feeds/najnovije.xml",
      "https://www.24sata.hr/feeds/news.xml",
      "https://www.24sata.hr/feeds/sport.xml",
      "https://www.24sata.hr/feeds/show.xml",
    ];
  }

  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
    try {
      for (let i = 0; i < this.rootLinks.length; i++) {
        const rootLink = this.rootLinks[i];
        const rss = await axios.get(rootLink);
        if (rss && rss.data) {
          const articleLinks = (rss.data as string)
            .match(/<link>(.*?)<\/link>/g)
            .map((articleLink) =>
              articleLink.replace("<link>", "").replace("</link>", "")
            )
            .filter((articleLink) => articleLink.includes("-"));
          if (articleLinks) {
            for (let j = 0; j < articleLinks.length; j++) {
              const articleLink = articleLinks[j];
              if (
                articles.findIndex((a) => a.articleLink == articleLink) > -1
              ) {
                continue;
              }
              const article = await axios.get(articleLink);
              if (article && article.data) {
                const articleHtml = article.data as string;
                const $ = cheerio.load(articleHtml);
                let title = $("h1.article__title")
                  .text()
                  .replace(/\n/g, "")
                  .trim();
                let lead = $("p.article__lead_text")
                  .text()
                  .replace(/\n/g, "")
                  .trim();
                let time = $("time.article__time")
                  .text()
                  .replace(/\n/g, "")
                  .trim();
                let author = $("span.article__authors_item")
                  .text()
                  .replace(/\n/g, "")
                  .replace(/Piše/g, "")
                  .replace(/  /g, "")
                  .trim();
                author = author.substring(0, author.length - 1);
                let content = $("div.article__content")
                  .html()
                  .replace(/<h3>Najčitaniji članci<\/h3>/g, "")
                  .replace(/\n/g, "")
                  .trim();
                if (content.includes("<img")) {
                  console.log(content);
                }
                articles.push({
                  ...this.defaultArticle(),
                  articleId: articleLink.substring(
                    articleLink.lastIndexOf("/") + 1
                  ),
                  articleLink,
                  author,
                  content,
                  lead,
                  time,
                  title,
                });
              }
            }
          }
        }
      }
      articles = articles.filter(
        (a) => Article.isValid(a) && Article.shouldBeDisplayed(a)
      );
      this.logger.info(
        "Scraped '%d' articles from '%s'",
        articles.length,
        this.name
      );
    } catch (error: any) {
      this.logger.error(error);
    }
    return articles;
  }

  defaultArticle(): Article {
    return {
      articleId: "",
      articleLink: "",
      author: "",
      backLink: `${PortalsRoutes.BASE}/${Portals.SATA24}`,
      content: "",
      lead: "",
      portalLink: this.link,
      portalName: this.name,
      portalType: Portals.SATA24,
      time: "",
      title: "",
    };
  }
}
