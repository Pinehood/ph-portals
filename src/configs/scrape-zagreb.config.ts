import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeZagrebConfig: ScraperConfig = {
  type: Portals.ZAGREB,
  name: "Zagreb Info",
  link: "https://www.zagreb.info",
  icon: "https://www.zagreb.info/wp-content/uploads/2018/02/zagreb-favicon-2.png",
  rss: false,
  roots: [
    "https://www.zagreb.info/category/hrvatska/page/1/",
    "https://www.zagreb.info/category/hrvatska/page/2/",
    "https://www.zagreb.info/category/hrvatska/page/3/",
    "https://www.zagreb.info/category/hrvatska/page/4/",
    "https://www.zagreb.info/category/hrvatska/page/5/",
    "https://www.zagreb.info/category/sport/page/1/",
    "https://www.zagreb.info/category/sport/page/2/",
    "https://www.zagreb.info/category/sport/page/3/",
    "https://www.zagreb.info/category/sport/page/4/",
    "https://www.zagreb.info/category/sport/page/5/",
  ],
  linker: "div.item-details > h3 > a",
  id: (link: string) =>
    link
      .substring(link.lastIndexOf("-") + 1)
      .replace("/", "-")
      .replace("/", "")
      .split("-")[1],
  remove1: ["img", "iframe", "figure", "div.wpipa-container"],
  title: {
    find: "h1.entry-title",
  },
  lead: {
    find: 'div.td-post-content p[style^="text-align: justify;"]',
    take: "first",
    transform: (value: string) => value.split(".")[0],
  },
  time: {
    find: "time.entry-date",
  },
  author: {
    find: "div.td-post-author-name strong",
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
