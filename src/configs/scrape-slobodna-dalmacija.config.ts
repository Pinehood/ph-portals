import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeSlobodnaDalmacijaConfig: ScraperConfig = {
  type: Portals.SLOBODNA_DALMACIJA,
  name: "Slobodna Dalmacija",
  link: "https://www.slobodnadalmacija.hr",
  icon: "https://slobodnadalmacija.hr/templates/site/images/pngs/favicon-sd/favicon-32x32.png",
  rss: true,
  roots: [
    "https://slobodnadalmacija.hr/feed",
    "https://slobodnadalmacija.hr/feed/category/119",
    "https://slobodnadalmacija.hr/feed/category/142",
    "https://slobodnadalmacija.hr/feed/category/241",
    "https://slobodnadalmacija.hr/feed/category/242",
    "https://slobodnadalmacija.hr/feed/category/243",
    "https://slobodnadalmacija.hr/feed/category/244",
    "https://slobodnadalmacija.hr/feed/category/255",
    "https://slobodnadalmacija.hr/feed/category/256",
  ],
  remove1: ["img", "iframe", "div.item__ad-center"],
  title: {
    find: "h1.item__title",
    take: "normal",
  },
  lead: {
    find: "span.card__egida",
    take: "first",
    transform: (value: string) => value.toUpperCase(),
  },
  time: {
    find: "div.item__dates",
    take: "normal",
  },
  author: {
    find: "span.item__author-name",
    take: "normal",
  },
  content: {
    find: "div.itemFullText",
  },
};
