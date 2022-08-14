import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Portals } from "@resources/common/constants";
import { Article } from "@resources/dtos";
import {
  getDefaultArticle,
  getPortalName,
  isValidArticle,
  shouldArticleBeDisplayed,
} from "@resources/common/functions";
import * as cheerio from "cheerio";
import axios from "axios";
import { ScraperService } from "@scrapers/services/scraper.service";

@Injectable()
export class ScrapeSportskeNovostiService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeSportskeNovostiService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.SPORTSKE_NOVOSTI;
    this.name = getPortalName(this.type);
    this.link = "https://sportske.jutarnji.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = [
      "https://sportske.jutarnji.hr/sn/nogomet/bundesliga/",
      "https://sportske.jutarnji.hr/sn/nogomet/serie-a/",
      "https://sportske.jutarnji.hr/sn/nogomet/premiership/",
      "https://sportske.jutarnji.hr/sn/nogomet/le-championnat",
      "https://sportske.jutarnji.hr/sn/nogomet/primera",
      "https://sportske.jutarnji.hr/sn/nogomet/reprezentacija/",
    ]; //Non-RSS

    // Pattern za linkove na stranice koje sadrze linkove na clanke  https://sportske.jutranji.hr/sn/sport/liga    ==> [https://sportske.jutarnji.hr/sn/nogomet/bundesliga/  ,https://sportske.jutarnji.hr/sn/kosarka/aba-liga, tak i za druge],
  }
  //Dohvation linkove na clanke
  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
    try {
      for (var i = 0; i < this.roots.length; i++) {
        try {
          let articleLinks = [];
          let articleData = await axios.get(this.roots[i]);
          if (articleData && articleData.data) {
            let data = articleData.data as string;
            let $ = cheerio.load(data);
            $("image").remove();
            $("iframe").remove();
            /*   let article = $("a.card_article-link").attr("href");
            console.log(article); */
            let links = $("main a[class=card__article-link]").each(
              (index, el) => {
                let articleLink = $(el).attr("href");
                if (articleLinks.findIndex((el) => el == articleLink) == -1) {
                  articleLinks.push(articleLink);
                }
              }
            );
          }
          console.log(articleLinks);
        } catch (innerError: any) {
          console.log(innerError);
        }
      }
    } catch (error) {}
    let $ = (articles = articles.filter(
      (a) => isValidArticle(a) && shouldArticleBeDisplayed(a)
    ));
    this.logger.info(
      "Scraped '%d' articles from '%s'",
      articles.length,
      this.name
    );
    return articles;
  }
}
