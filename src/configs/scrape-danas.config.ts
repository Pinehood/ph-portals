import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeDanasConfig: ScraperConfig = {
  type: Portals.DANAS,
  name: "Danas",
  link: "https://www.danas.hr",
  icon: "https://cdn.danas.hr/favicon/danas/favicon-16x16.png",
  rss: false,
  roots: [
    "https://www.danas.hr/hrvatska",
    "https://www.danas.hr/svijet",
    "https://www.danas.hr/sport",
    "https://www.danas.hr/crna-kronika",
    "https://www.danas.hr/vrijeme",
    "https://www.danas.hr/videovijesti/vijesti-videa",
  ],
  linker: "div.articleCard a.cardInner",
  remove1: [
    "img",
    "iframe",
    "figure",
    "picture",
    'div[id="mobileScaleDown"]',
    'div[id="desktopScaleDown"]',
  ],
  title: {
    find: "h1.title",
    take: "first",
    transform: (value: string): string => value.replace(/Više s weba/g, ""),
  },
  lead: {
    find: "span.subtitle",
  },
  time: {
    find: "div.meta_info_items",
    take: "first",
    transform: (value: string) => value.split("/")[0],
  },
  author: {
    find: "div.meta_info_items a",
  },
  remove2: [
    "section",
    "style",
    "span.Slot_title",
    "div.Slot_content",
    "svg",
    "path",
  ],
  content: {
    find: "article.article-body",
  },
};
