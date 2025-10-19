import { randomUUID } from "crypto";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeNetConfig: ScraperConfig = {
  type: Portals.NET,
  name: "Net",
  link: "https://www.net.hr",
  icon: "https://net.hr/themes/nethr/graphics/android-icon-36x36.png",
  rss: true,
  roots: [
    "https://net.hr/danas/rss.xml",
    "https://net.hr/sport/rss.xml",
    "https://net.hr/hot/rss.xml",
    "https://net.hr/magazin/rss.xml",
    "https://net.hr/webcafe/rss.xml",
  ],
  remove1: [
    "img",
    "iframe",
    "div.Image-noPlaceholder",
    "div.css-86pgy2",
    'div[id="mobileScaleDown"]',
    'div[id="desktopScaleDown"]',
    "div.cls_frame",
    "div.css-vymk8z",
    "div.is_newInarticleWidgets",
    "div.video-js",
    "figure",
    "div.se-card--content",
    "video",
    "picture",
    "script",
  ],
  id: () => randomUUID(),
  title: {
    find: "h1.se-article--head",
    transform: (value: string) => value.replace("/", "").trim(),
  },
  lead: {
    find: "p.se-article--subhead",
    transform: (value: string) => value.replace("/", "").trim(),
  },
  time: {
    find: "div.publish--time",
    transform: (value: string) =>
      value.split(/[a-z]/gi)[0] ? value.split(/[a-z]/gi)[0] : "nedostupno",
  },
  author: {
    find: "a.se_article_author",
    transform: (value: string) => value.replace(/\//g, ",").trim(),
  },
  content: {
    find: "div.se-article--text",
  },
};
