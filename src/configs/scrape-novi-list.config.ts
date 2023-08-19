import { randomUUID } from "crypto";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeNoviListConfig: ScraperConfig = {
  type: Portals.NOVI_LIST,
  name: "Novi List",
  link: "https://www.novilist.hr/",
  icon: "https://www.novilist.hr/wp-content/themes/novi-list-wp/favicon/android-chrome-192x192.png",
  rss: false,
  roots: [
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=25&cat=1&type=category",
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=25&cat=2&type=category",
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=25&cat=3&type=category",
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=25&cat=4&type=category",
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=25&cat=5&type=category",
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=25&cat=6&type=category",
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=25&cat=7&type=category",
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=25&cat=8&type=category",
    "https://www.novilist.hr/wp-json/wp/v2/posts?per_page=25&cat=9&type=category",
  ],
  id: () => randomUUID(),
  remove1: ["img", "figure", "iframe", "div.lwdgt", "div.linked-news"],
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
  content: {
    find: "div.user-content",
  },
};
