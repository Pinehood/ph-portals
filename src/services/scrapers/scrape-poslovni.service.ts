import axios from "@/common/axios";
import * as cheerio from "cheerio";
import { Article } from "@/dtos";
import {
  getDefaultArticle,
  getPortalName,
  isValidArticle,
  Portals,
  ScraperService,
  shouldArticleBeDisplayed,
  TryCatch,
} from "@/common";

export class ScrapePoslovniService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor() {
    this.type = Portals.POSLOVNI;
    this.name = getPortalName(this.type);
    this.link = "https://www.poslovni.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://www.poslovni.hr/vijesti/hrvatska",
      "https://www.poslovni.hr/vijesti/regija",
      "https://www.poslovni.hr/vijesti/europska-unija",
      "https://www.poslovni.hr/vijesti/svijet",
      "https://www.poslovni.hr/sci-tech",
      "https://www.poslovni.hr/kompanije",
      "https://www.poslovni.hr/financije",
      "https://www.poslovni.hr/lifestyle",
    ];
  }

  async links(): Promise<string[]> {
    const articleLinks: string[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      await TryCatch(async () => {
        const articlesData = await axios.get(rootLink);
        if (articlesData && articlesData.data) {
          const $ = cheerio.load(articlesData.data as string);
          $("article a").each((_index, el) => {
            const articleLink = $(el).attr("href");
            if (
              articleLinks.findIndex((el) => el == articleLink) == -1 &&
              articleLink.startsWith("https://")
            ) {
              articleLinks.push(articleLink);
            }
          });
        }
      });
    }
    return articleLinks;
  }

  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
    const articleLinks = await this.links();
    if (articleLinks && articleLinks.length > 0) {
      for (let i = 0; i < articleLinks.length; i++) {
        const articleLink = articleLinks[i];
        if (articles.findIndex((a) => a.articleLink == articleLink) > -1)
          continue;

        await TryCatch(async () => {
          const article = await axios.get(articleLink);
          if (article && article.data) {
            const articleHtml = article.data as string;
            const $ = cheerio.load(articleHtml);
            $("img").remove();
            $("iframe").remove();
            $("figure").remove();
            $("picture").remove();
            $("div.lwdgt").remove();
            let title = $("h1.title").text();
            if (title) {
              title = title.replace(/\n/g, "").trim();
            }
            let lead = $("div.single__lead").text();
            if (lead) {
              lead = lead.replace(/\n/g, "").trim();
            }
            let author = $("a.single__meta-author").text().trim();
            if (author) {
              author = author.replace(/\n/g, "").replace(/  /g, "").trim();
            }
            let time = $("span.text").first().text().replace(",", "");
            if (time) {
              time = time.replace(/\n/g, "").trim();
            } else {
              time = "nedostupno";
            }
            let content = $("div.article__content").html();
            if (content) {
              content = content.replace(/\n/g, "").trim();
            }
            articles.push({
              ...this.default,
              articleId: articleLink.substring(
                articleLink.lastIndexOf("-") + 1
              ),
              articleLink,
              author,
              content,
              lead,
              time,
              title,
            });
          }
        });
      }
      articles = articles.filter(
        (a) => isValidArticle(a) && shouldArticleBeDisplayed(a)
      );
    }
    return articles;
  }
}
