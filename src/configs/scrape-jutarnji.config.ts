import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeJutarnjiConfig: ScraperConfig = {
  type: Portals.JUTARNJI,
  name: "Jutarnji",
  link: "https://www.jutarnji.hr",
  icon: "https://www.jutarnji.hr/templates/site/images/pngs/favicon-jl/android-chrome-192x192.png",
  rss: false,
  roots: [
    "https://www.jutarnji.hr/vijesti",
    "https://www.jutarnji.hr/vijesti/hrvatska",
    "https://www.jutarnji.hr/vijesti/svijet",
    "https://www.jutarnji.hr/vijesti/zagreb",
    "https://www.jutarnji.hr/vijesti/crna-kronika",
  ],
  linker: "a.card__article-link",
  remove1: [
    "img",
    "iframe",
    "div.se-embed--photo",
    "div.item__related",
    "script",
  ],
  title: {
    find: "h1.item__title",
  },
  lead: {
    find: "div.item__subtitle",
  },
  time: {
    find: "span.item__author__date",
  },
  author: {
    find: "span.item__author-name",
  },
  content: {
    find: "div.itemFullText",
  },
};
