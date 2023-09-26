import { randomUUID } from "crypto";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeNoviListConfig: ScraperConfig = {
  type: Portals.NOVI_LIST,
  name: "Novi List",
  link: "https://www.novilist.hr",
  icon: "https://www.novilist.hr/wp-content/themes/novi-list-wp/favicon/android-chrome-192x192.png",
  rss: false,
  roots: [
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=100&page=1",
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=100&page=2",
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=100&page=3",
  ],
  id: () => randomUUID(),
  remove1: ["img", "figure", "iframe", "div.lwdgt", "div.linked-news", "br"],
  title: {
    find: "h1.article-title",
  },
  lead: {
    find: "p.intro-text",
  },
  time: {
    find: "p.article-date",
  },
  author: {
    find: "p.editor-name",
  },
  remove2: ["script"],
  content: {
    find: "div.user-content",
  },
};
