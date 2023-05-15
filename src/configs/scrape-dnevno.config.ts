import * as cheerio from "cheerio";
import axios from "@/common/axios";
import { Portals, ScraperConfig } from "@/common";

export const ScrapeDnevnoConfig: ScraperConfig = {
  type: Portals.DNEVNO,
  name: "Dnevno",
  link: "https://www.dnevno.hr",
  icon: "https://dnevno.hr/favicon.ico",
  rss: false,
  roots: [
    "https://www.dnevno.hr/category/vijesti",
    "https://www.dnevno.hr/category/sport",
    "https://www.dnevno.hr/category/magazin",
    "https://www.dnevno.hr/category/gospodarstvo-i-turizam",
    "https://www.dnevno.hr/category/planet-x",
    "https://www.dnevno.hr/category/zdravlje",
    "https://www.dnevno.hr/category/domovina",
    "https://www.dnevno.hr/category/vjera",
  ],
  id: (link: string) =>
    link.substring(link.lastIndexOf("-") + 1).replace("/", ""),
  links: async (link: string) => {
    const articleLinks: string[] = [];
    const articlesData = await axios.get(link);
    if (articlesData && articlesData.data) {
      const $ = cheerio.load(articlesData.data as string);
      $("article.post a").each((_index, el) => {
        const articleLink = $(el).attr("href");
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
  remove1: [
    "img",
    "iframe",
    "div.wpipa-container",
    "div.lwdgt-container",
    "p.lwdgt-logo",
  ],
  title: {
    find: "h1",
    take: "normal",
  },
  lead: {
    find: "a.title",
    take: "normal",
  },
  time: {
    find: "time.date",
    take: "first",
    transform: (value: string) => {
      const split = value.split(",");
      const day = split[0].trim();
      const date = split[1].replace(day, "").trim();
      return (day + ", " + date).trim();
    },
  },
  author: {
    find: "span.author",
    take: "first",
    transform: (value: string) => value.split("Autor:")[1],
  },
  remove2: [
    "div.img-holder",
    "div.heading",
    "h1",
    "style",
    "div.info",
    "div.info-holder",
  ],
  content: {
    find: "section.description",
  },
};
