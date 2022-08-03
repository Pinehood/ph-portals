import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import axios from "axios";
import { Article, Portals, PortalsRoutes } from "@modules/common";
import { ScraperService } from "@scrapers/services/scraper.service";
//import * as cheerio from "cheerio";

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
    const articles: Article[] = [];
    const defaultArticle: Article = {
      articleId: "",
      articleLink: "",
      author: "",
      backLink: `${PortalsRoutes.BASE}/${Portals.SATA24}`,
      content: "",
      lead: "",
      portalLink: this.link,
      portalName: this.name,
      time: "",
      title: "",
    };
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
              const article = await axios.get(articleLink);
              if (article && article.data) {
                //const articleText = article.data as string;
                //TODO: scrape data of each article with $/cheerio
                //const $ = cheerio.load(articleText);
                articles.push({
                  ...defaultArticle,
                  articleId: articleLink.substring(
                    articleLink.lastIndexOf("/") + 1
                  ),
                  articleLink: articleLink,
                  author: "",
                  content: "",
                  lead: "",
                  time: "",
                  title: "",
                });
              }
            }
          }
        }
      }
    } catch (error: any) {
      this.logger.error(error);
    }
    return articles;
  }
}
