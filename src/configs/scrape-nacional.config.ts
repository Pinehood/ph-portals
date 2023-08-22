import { randomUUID } from "crypto";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeNacionalConfig: ScraperConfig = {
  type: Portals.NACIONAL,
  name: "Nacional",
  link: "https://nacional.hr",
  icon: "https://www.nacional.hr/wp-content/uploads/2023/03/nacional-logo.png",
  rss: false,
  roots: [
    "https://www.nacional.hr/category/vijesti/hrvatska",
    "https://www.nacional.hr/category/vijesti/hrvatska/page/2",
    "https://www.nacional.hr/category/vijesti/svijet",
    "https://www.nacional.hr/category/vijesti/svijet/page/2",
    "https://www.nacional.hr/category/sport/nogomet",
    "https://www.nacional.hr/category/sport/kosarka",
    "https://www.nacional.hr/category/sport/tenis",
  ],
  id: () => randomUUID(),
  linker: "div.news-list-content-wrapper > header > h2 > a",
  remove1: [
    "img",
    "iframe",
    "blockquote.wp-embedded-content",
    "div.heateor_sssp_sharing_ul",
  ],
  title: {
    find: "h1.entry-title",
  },
  lead: {
    find: "div.entry-content > p:nth-child(2) > strong",
  },
  time: {
    find: "time.single-post-date",
  },
  author: {
    find: "div.single-post-author",
    transform: (value: string) => value.replace("Autor: ", ""),
  },
  content: {
    find: "div.entry-content",
  },
};
