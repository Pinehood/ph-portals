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
  remove1: ["img", "iframe"],
  title: {
    find: "h1.entry-title",
  },
  lead: {
    find: "div.entry-content > p:nth-child(3) > strong",
  },
  time: {
    find: "span.post-time",
  },
  author: {
    find: "span.post-author",
    transform: (value: string) => value.replace("Autor: ", ""),
  },
  remove2: [
    "div.uc-social-bar-wrapper",
    "div.feature-media",
    "section.in-post-related-news",
  ],
  content: {
    find: "div.entry-content",
  },
};
