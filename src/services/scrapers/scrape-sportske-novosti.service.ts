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

export class ScrapeSportskeNovostiService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor() {
    this.type = Portals.SPORTSKE_NOVOSTI;
    this.name = getPortalName(this.type);
    this.link = "https://sportske.jutarnji.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://sportske.jutarnji.hr/sn/nogomet/bundesliga",
      "https://sportske.jutarnji.hr/sn/nogomet/serie-a",
      "https://sportske.jutarnji.hr/sn/nogomet/premiership",
      "https://sportske.jutarnji.hr/sn/nogomet/le-championnat",
      "https://sportske.jutarnji.hr/sn/nogomet/primera",
      "https://sportske.jutarnji.hr/sn/nogomet/reprezentacija",
      "https://sportske.jutarnji.hr/sn/kosarka/aba-liga",
      "https://sportske.jutarnji.hr/sn/kosarka/nba",
      "https://sportske.jutarnji.hr/sn/kosarka/basket-euroliga",
      "https://sportske.jutarnji.hr/sn/kosarka/basket-international",
      "https://sportske.jutarnji.hr/sn/sport-mix/rukomet/rukomet-lpm",
      "https://sportske.jutarnji.hr/sn/tenis/atp-wta-turniri",
      "https://sportske.jutarnji.hr/sn/tenis/grand-slam",
      "https://sportske.jutarnji.hr/sn/tenis/davis-cup",
      "https://sportske.jutarnji.hr/sn/sport-mix/",
    ];
  }

  async links(): Promise<string[]> {
    const articleLinks: string[] = [];
    for (let i = 0; i < this.roots.length; i++) {
      const rootLink = this.roots[i];
      await TryCatch(async () => {
        const articlesData = await axios.get(rootLink);
        if (articlesData && articlesData.data) {
          const data = articlesData.data as string;
          const $ = cheerio.load(data);
          $("image").remove();
          $("iframe").remove();
          $("main a[class=card__article-link]").each((_index, el) => {
            const articleLink = $(el).attr("href");
            if (articleLinks.findIndex((el) => el == articleLink) == -1) {
              articleLinks.push(this.link + articleLink);
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
            $("script").remove();
            let title = $("h1.item__title").text();
            if (title) {
              title = title.replace(/\n/g, "").trim();
            }
            let lead = $("div.item__subtitle").text();
            if (lead) {
              lead = lead.replace(/\n/g, "").trim();
            }
            let author = $("span.item__author-name").text();
            if (author) {
              author = author.replace(/\n/g, "").trim();
            }
            let time = $("span.item__author__date").text();
            if (time) {
              time = time.replace(/\n/g, "").trim();
            } else {
              time = "nedostupno";
            }
            let content = $("div.itemFullText").html();
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
