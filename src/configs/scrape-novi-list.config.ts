import { randomUUID } from "crypto";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeNoviListConfig: ScraperConfig = {
  type: Portals.NOVI_LIST,
  name: "Novi List",
  link: "https://www.novilist.hr/",
  icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Novi_list_Logo.svg/2560px-Novi_list_Logo.svg.png",
  rss: false,
  roots: [
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=1&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=2&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=3&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=4&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=5&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=6&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=7&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=8&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=9&type=category",
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
