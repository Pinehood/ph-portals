import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeZagrebConfig: ScraperConfig = {
  type: Portals.ZAGREB,
  name: "ZagrebInfo",
  link: "https://www.zagreb.info",
  icon: "https://www.zagreb.info/wp-content/uploads/2018/02/zagreb-favicon-2.png",
  rss: true,
  roots: ["https://www.zagreb.info/feed"],
  id: (link: string) =>
    link
      .substring(link.lastIndexOf("-") + 1)
      .replace("/", "-")
      .replace("/", "")
      .split("-")[1],
  remove1: ["img", "iframe", "figure", "div.wpipa-container"],
  title: {
    find: "h1.entry-title",
    take: "normal",
  },
  lead: {
    find: 'div.td-post-content p[style^="text-align: justify;"]',
    take: "first",
    transform: (value: string) => value.split(".")[0],
  },
  time: {
    find: "time.entry-date",
    take: "normal",
  },
  author: {
    find: "div.td-post-author-name strong",
    take: "normal",
  },
  remove2: [
    "div.td-post-featured-image",
    "iframe.instagram-media",
    "div.under-article-ads",
    "div.td-post-sharing-bottom",
    "div.fb-comments",
    "h3",
  ],
  content: {
    find: "div.td-post-content",
  },
};
