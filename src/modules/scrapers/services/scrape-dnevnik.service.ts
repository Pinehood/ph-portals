import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import axios from "axios";
import * as cheerio from "cheerio";
import { Portals } from "@resources/common/constants";
import { Article } from "@resources/dtos";
import {
  getDefaultArticle,
  getPortalName,
  isValidArticle,
  shouldArticleBeDisplayed,
} from "@resources/common/functions";
import { ScraperService } from "@scrapers/services/scraper.service";

@Injectable()
export class ScrapeDnevnikService implements ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;

  constructor(
    @InjectPinoLogger(ScrapeDnevnikService.name)
    private readonly logger: PinoLogger
  ) {
    this.type = Portals.DNEVNIK;
    this.name = getPortalName(this.type);
    this.link = "https://www.dnevnik.hr";
    this.default = getDefaultArticle(this.type, this.link, this.name);
    this.roots = ["https://dnevnik.hr/ajax/loadMore"];
  }

  async scrape(): Promise<Article[]> {
    let articles: Article[] = [];
    const articleLinks = await this.getArticleLinks();
    if (articleLinks) {
      for (let j = 0; j < articleLinks.length; j++) {
        const articleLink = articleLinks[j];
        if (articles.findIndex((a) => a.articleLink == articleLink) > -1)
          continue;

        try {
          const article = await axios.get(articleLink);
          if (article && article.data) {
            const articleHtml = article.data as string;
            const $ = cheerio.load(articleHtml);
            $("img").remove();
            $("iframe").remove();
            $("figure").remove();
            $("picture").remove();
            $("div.banner-holder").remove();
            $("div.main-media-hodler").remove();
            $("div.video-gallery").remove();
            $("div.play-buttons").remove();
            $("span.related-news").remove();
            let title = $("h1.title").text();
            if (title) {
              title = title.replace(/\n/g, "").trim();
            }
            let lead = $("p.lead").text();
            if (lead) {
              lead = lead.replace(/\n/g, "").trim();
            }
            const authorTime = $("span.author-time").text();
            let author = authorTime.substring(
              0,
              authorTime.lastIndexOf(",") - 1
            );
            if (author) {
              author = author
                .replace(/\n/g, "")
                .replace(/Piše/g, "")
                .replace(/  /g, "")
                .trim();
            }
            let time = authorTime.substring(authorTime.lastIndexOf(",") + 1);
            if (time) {
              time = time.replace(/\n/g, "").trim();
            } else {
              time = "nedostupno";
            }
            let content = $("div.article-body").html();
            if (content) {
              content = content.replace(/\n/g, "").trim();
            }
            articles.push({
              ...this.default,
              articleId: articleLink
                .substring(articleLink.lastIndexOf("-") + 1)
                .replace(".html", ""),
              articleLink,
              author,
              content,
              lead,
              time,
              title,
            });
          }
        } catch (innerError: any) {
          if (
            innerError.response &&
            innerError.response.status &&
            innerError.response.status >= 400
          ) {
            this.logger.error(
              "Failed to retrieve data for article '%s' with status code '%d'",
              articleLink,
              innerError.response.status
            );
          } else {
            this.logger.error(innerError);
          }
        }
      }
    }
    articles = articles.filter(
      (a) => isValidArticle(a) && shouldArticleBeDisplayed(a)
    );
    this.logger.info(
      "Scraped '%d' articles from '%s'",
      articles.length,
      this.name
    );
    return articles;
  }

  private async getArticleLinks(): Promise<string[]> {
    try {
      const data =
        "type=ng&boxInfo%5Btype%5D=Frontend_Box_Front_Entity_List&boxInfo%5Bparams%5D%5BuseFrontOptions%5D=&boxInfo%5Bparams%5D%5Bprofile%5D=&boxInfo%5Bparams%5D%5BparamsLoader%5D=&boxInfo%5Bparams%5D%5BallowedContentTypes%5D=article&boxInfo%5Bparams%5D%5Btemplate%5D=frontend%2Fbox%2Ffront%2Fentity%2Fsection-news-dnevnik.twig&boxInfo%5Bparams%5D%5BboxTitle%5D=&boxInfo%5Bparams%5D%5BtargetUrl%5D=&boxInfo%5Bparams%5D%5BcssClass%5D=&boxInfo%5Bparams%5D%5BpreventDuplicates%5D=1&boxInfo%5Bparams%5D%5BshowLoadMore%5D=ajax&boxInfo%5Bparams%5D%5Bsources%5D=subsectionarticles&boxInfo%5Bparams%5D%5Blimits%5D=200&boxInfo%5Bparams%5D%5BeditDescription%5D=&boxInfo%5Bctx%5D%5BsiteId%5D=10&boxInfo%5Bctx%5D%5BsectionId%5D=10001&boxInfo%5Bctx%5D%5BsubsiteId%5D=10004457&boxInfo%5Bctx%5D%5BlayoutDeviceVariant%5D=default&boxInfo%5Bctx%5D%5BlayoutFrontVariant%5D=default";
      const ajaxResponse = await axios.request({
        method: "POST",
        data: data,
        url: this.roots[0],
        headers: {
          Host: "dnevnik.hr",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      });
      return (ajaxResponse.data as string)
        .match(/<a data-upscore-url href="(.*)">/g)
        .map((articleLink) => {
          return (
            this.link +
            "/" +
            articleLink
              .replace('<a data-upscore-url href="', "")
              .replace('">', "")
          );
        });
    } catch (error: any) {
      this.logger.error(error);
      return null;
    }
  }
}
