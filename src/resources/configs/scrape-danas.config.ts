import * as cheerio from "cheerio";
import axios from "@common/axios";
import { Portals, ScraperConfig } from "@root/common";

export const ScrapeDanasConfig: ScraperConfig = {
  type: Portals.DANAS,
  name: "Danas",
  link: "https://www.danas.hr",
  icon: "https://cdn.danas.hr/favicon/danas/favicon-16x16.png",
  rss: false,
  roots: [
    "https://www.danas.hr/hrvatska",
    "https://www.danas.hr/svijet",
    "https://www.danas.hr/sport",
    "https://www.danas.hr/crna-kronika",
    "https://www.danas.hr/vrijeme",
    "https://www.danas.hr/videovijesti/vijesti-videa",
  ],
  id: async (link: string) => link.substring(link.lastIndexOf("-") + 1),
  links: async (link: string) => {
    const articleLinks: string[] = [];
    const articlesData = await axios.get(link);
    if (articlesData && articlesData.data) {
      const $ = cheerio.load(articlesData.data as string);
      $("div.articleCard a.cardInner").each((_index, el) => {
        const articleLink = "https://www.danas.hr" + $(el).attr("href");
        if (
          articleLinks.findIndex((el) => el == articleLink) == -1 &&
          articleLink.startsWith("https://")
        ) {
          articleLinks.push(articleLink);
        }
      });
    }
    return articleLinks;
  },
  remove1: ["img", "iframe", "figure", "picture"],
  title: {
    find: "span.titleContent",
    take: "first",
  },
  lead: {
    find: "span.subtitle",
    take: "normal",
  },
  time: {
    find: "div.meta_info_items",
    take: "first",
    transform: (value: string) => value.split("/")[0],
  },
  author: {
    find: "div.meta_info_items a",
    take: "normal",
  },
  remove2: [
    "section",
    "style",
    "span.Slot_title",
    "div.Slot_content",
    "svg",
    "path",
  ],
  content: {
    find: "article.article-body",
  },
};
