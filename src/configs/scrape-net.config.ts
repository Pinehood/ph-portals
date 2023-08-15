import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeNetConfig: ScraperConfig = {
  type: Portals.NET,
  name: "Net",
  link: "https://www.net.hr",
  icon: "https://cdn.net.hr/favicon/favicon-32x32.png",
  rss: true,
  roots: [
    "https://net.hr/feed",
    "https://net.hr/feed/danas",
    "https://net.hr/feed/sport",
    "https://net.hr/feed/hot",
    "https://net.hr/feed/magazin",
    "https://net.hr/feed/webcafe",
  ],
  remove1: [
    "img",
    "iframe",
    "div.Image-noPlaceholder",
    "div.css-86pgy2",
    'div[id="mobileScaleDown"]',
    'div[id="desktopScaleDown"]',
    "div.cls_frame",
  ],
  title: {
    find: "span.title_title",
  },
  lead: {
    find: "span.title_subtitle",
    transform: (value: string) => value.replace("/", "").trim(),
  },
  time: {
    find: "div.metaItem_title",
    transform: (value: string) =>
      value.split(/[a-z]/gi)[0] ? value.split(/[a-z]/gi)[0] : "nedostupno",
  },
  author: {
    find: 'div[id="meta_author"]',
    transform: (value: string) => value.replace(/\//g, ",").trim(),
  },
  content: {
    find: "article.article-body",
  },
};
