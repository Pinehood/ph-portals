import * as cheerio from "cheerio";
import axios from "@/common/axios";
import { CommonConstants, Params, Portals, Tokens } from "@/common/enums";
import { PortalsRoutes } from "@/common/routes";
import { PORTAL_SCRAPERS } from "@/common/constants";
import { ScraperConfig } from "@/common/types";

export class LinkService {
  static redirect(portal: Portals, content: string): string {
    try {
      return content.replace(
        Tokens.REDIRECT_URL,
        PortalsRoutes.PORTAL.replace(`:${Params.PORTAL}`, portal),
      );
    } catch {
      return PortalsRoutes.PORTAL.replace(`:${Params.PORTAL}`, Portals.HOME);
    }
  }

  static portals(portal: Portals, content: string): string {
    try {
      let linksHtml = "";
      Object.keys(Portals).forEach((value) => {
        const por = Portals[value];
        const psc = PORTAL_SCRAPERS[por] as ScraperConfig;
        if (psc) {
          let linkHtml = content
            .replace(Tokens.PORTAL, por)
            .replace(Tokens.LINK, psc.icon)
            .replace(Tokens.NAME, psc.name);
          if (por == portal) {
            linkHtml = linkHtml.replace(
              Tokens.ACTIVE,
              CommonConstants.ACTIVE_ITEM,
            );
          } else {
            linkHtml = linkHtml.replace(Tokens.ACTIVE, "");
          }
          linksHtml += linkHtml;
        }
      });
      return linksHtml;
    } catch {
      return "";
    }
  }

  static async rss(link: string, base: string): Promise<string[]> {
    try {
      const rss = await axios.get(link);
      if (rss && rss.data) {
        return (rss.data as string)
          .match(/<link>(.*?)<\/link>/g)
          .map((link) => {
            let articleLink = link.replace("<link>", "").replace("</link>", "");
            if (!articleLink.startsWith("http")) {
              if (!articleLink.startsWith("/")) {
                articleLink = `${base}/${articleLink}`;
              } else {
                articleLink = `${base}${articleLink}`;
              }
            }
            return articleLink;
          })
          .filter((articleLink) => articleLink.includes("-"));
      }
    } catch {
      return [];
    }
  }

  static async normal(
    link: string,
    base: string,
    find: string,
  ): Promise<string[]> {
    try {
      const articleLinks: string[] = [];
      const articlesData = await axios.get(link);
      if (articlesData && articlesData.data) {
        const $ = cheerio.load(articlesData.data as string);
        $(find).each((_, el) => {
          let articleLink = $(el).attr("href");
          if (!articleLink.startsWith("http")) {
            if (!articleLink.startsWith("/")) {
              articleLink = `${base}/${articleLink}`;
            } else {
              articleLink = `${base}${articleLink}`;
            }
          }
          if (articleLinks.findIndex((el) => el == articleLink) == -1) {
            articleLinks.push(articleLink);
          }
        });
      }
      return articleLinks;
    } catch {
      return [];
    }
  }

  static async json(link: string, base: string): Promise<string[]> {
    try {
      const articleLinks: string[] = [];
      const list = await axios.get(link);
      const processLink = (articleLink: string) => {
        if (!articleLink.startsWith("http")) {
          if (!articleLink.startsWith("/")) {
            articleLink = `${base}/${articleLink}`;
          } else {
            articleLink = `${base}${articleLink}`;
          }
        }
        if (articleLinks.findIndex((el) => el == articleLink) == -1) {
          articleLinks.push(articleLink);
        }
      };
      if (list && list.data) {
        const obj = JSON.parse(list.data) as {
          posts: any[];
        };
        if (obj && obj.posts && obj.posts.length > 0) {
          for (let i = 0; i < obj.posts.length; i++) {
            const post = obj.posts[i];
            let articleLink = post.permalink;
            if (!articleLink) articleLink = post.link;
            processLink(articleLink);
          }
        } else {
          const arr = JSON.parse(list.data) as any[];
          if (arr && arr.length > 0) {
            for (let i = 0; i < arr.length; i++) {
              const post = arr[i];
              let articleLink = post.permalink;
              if (!articleLink) articleLink = post.link;
              processLink(articleLink);
            }
          }
        }
      }
      return articleLinks;
    } catch {
      return [];
    }
  }
}
