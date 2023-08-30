import { randomUUID } from "crypto";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeTelegramConfig: ScraperConfig = {
  type: Portals.TELEGRAM,
  name: "Telegram",
  link: "https://telegram.hr",
  icon: "https://www.telegram.hr/_nuxt/icons/icon_64x64.28ac38.png",
  rss: false,
  roots: [
    "https://www.telegram.hr/api/category/najnovije/page/1",
    "https://www.telegram.hr/api/category/najnovije/page/2",
    "https://www.telegram.hr/api/category/najnovije/page/3",
    "https://www.telegram.hr/api/category/najnovije/page/4",
    "https://www.telegram.hr/api/category/najnovije/page/5",
    "https://www.telegram.hr/api/category/najnovije/page/6",
    "https://www.telegram.hr/api/category/najnovije/page/7",
    "https://www.telegram.hr/api/category/najnovije/page/8",
    "https://www.telegram.hr/api/category/najnovije/page/9",
    "https://www.telegram.hr/api/category/najnovije/page/10",
  ],
  id: () => randomUUID(),
  remove1: [
    "img",
    "figure",
    "iframe",
    'div[id="intext_premium"]',
    "div.lwdgt",
    "div.banner-separator",
  ],
  title: {
    find: "h1.full",
  },
  lead: {
    find: "h2.full",
  },
  time: {
    find: "div.full.column.article-head.column-top-pad.flex > h5:nth-child(6) > span",
    take: "first",
  },
  author: {
    find: "div.full.column.article-head.column-top-pad.flex > h5:nth-child(6) > a:nth-child(2) > span.vcard.author",
    take: "first",
  },
  content: {
    find: 'div[id="article-content"]',
  },
};
