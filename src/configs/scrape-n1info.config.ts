import { randomUUID } from "crypto";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeN1InfoConfig: ScraperConfig = {
  type: Portals.N1_INFO,
  name: "N1 Info",
  link: "https://www.n1info.hr",
  icon: "https://n1info.hr/wp-content/uploads/2020/12/favicon.png",
  rss: true,
  roots: ["https://n1info.hr/feed"],
  id: () => randomUUID(),
  remove1: [
    "img",
    "iframe",
    "div.dynamic-banner",
    "div.banner-mobile",
    "figure",
    "div.hidden",
    "div.ad-loading-placeholder",
    "div.related-news-block",
    "div.tags-article-block-wrapper",
    "div.cta-comment-wrapper",
  ],
  title: {
    find: "h1.title",
  },
  lead: {
    find: "p.leading-8",
  },
  time: {
    find: "div.timestamp",
    transform: (value: string) => {
      const year = new Date().getFullYear();
      return `${value.split(`${year}`)[0]}${year}`;
    },
  },
  author: {
    find: "span.author-name",
    transform: (value: string) => value.replace("Autor: ", ""),
  },
  remove2: [
    "div.uc-social-bar-wrapper",
    "div.feature-media",
    "section.in-post-related-news",
  ],
  content: {
    find: "article.article-wrapper",
  },
};
