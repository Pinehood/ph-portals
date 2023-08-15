import { randomUUID } from "crypto";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeTportalConfig: ScraperConfig = {
  type: Portals.TPORTAL,
  name: "Tportal",
  link: "https://www.tportal.hr",
  icon: "https://tportal.hr/favicon.ico",
  rss: false,
  roots: ["https://www.tportal.hr/najnovije-vijesti"],
  id: () => randomUUID(),
  linker: "a.articlePreview",
  remove1: [
    "img",
    "iframe",
    "div.banner",
    "div.embedComponent",
    "div.mediaComponent",
    "div.iframeWrap",
    "div.autoRelatedArticles",
    "div.listComponentType2",
    "div.related-news",
    "figure",
    "figcaption",
  ],
  title: {
    find: "h1.js_articleTitle",
  },
  lead: {
    find: "div.js_articleText p",
    take: "first",
    transform: (value: string) => value.split(".")[0],
  },
  time: {
    find: "header > div.grow-0.shrink-0.basis-full > div > div:nth-child(3)",
    take: "last",
    transform: (value: string) => value.replace("Objavljeno", ""),
  },
  author: {
    find: 'a[href^="/autor"] p',
    transform: (value: string) =>
      value
        .replace("Autor: ", "")
        .replace(/\n/g, "")
        .replace(/  /g, "")
        .split("Zadnja")[0]
        .trim(),
  },
  content: {
    find: "div.article-content",
  },
};
