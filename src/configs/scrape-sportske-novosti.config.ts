import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeSportskeNovostiConfig: ScraperConfig = {
  type: Portals.SPORTSKE_NOVOSTI,
  name: "Sportske Novosti",
  link: "https://sportske.jutarnji.hr",
  icon: "https://sportske.jutarnji.hr/templates/site/images/pngs/favicon-sn/android-icon-192x192.png",
  rss: false,
  roots: [
    "https://sportske.jutarnji.hr/sn/nogomet/bundesliga",
    "https://sportske.jutarnji.hr/sn/nogomet/serie-a",
    "https://sportske.jutarnji.hr/sn/nogomet/premiership",
    "https://sportske.jutarnji.hr/sn/nogomet/le-championnat",
    "https://sportske.jutarnji.hr/sn/nogomet/primera",
    "https://sportske.jutarnji.hr/sn/nogomet/reprezentacija",
    "https://sportske.jutarnji.hr/sn/kosarka/aba-liga",
    "https://sportske.jutarnji.hr/sn/kosarka/nba",
    "https://sportske.jutarnji.hr/sn/kosarka/basket-euroliga",
    "https://sportske.jutarnji.hr/sn/kosarka/basket-international",
    "https://sportske.jutarnji.hr/sn/sport-mix/rukomet/rukomet-lpm",
    "https://sportske.jutarnji.hr/sn/tenis/atp-wta-turniri",
    "https://sportske.jutarnji.hr/sn/tenis/grand-slam",
    "https://sportske.jutarnji.hr/sn/tenis/davis-cup",
    "https://sportske.jutarnji.hr/sn/sport-mix/",
  ],
  linker: {
    find: "main a[class=card__article-link]",
    prefix: "https://sportske.jutarnji.hr",
  },
  remove1: ["img", "iframe", "figure", "picture", "script"],
  title: {
    find: "h1.item__title",
    take: "normal",
  },
  lead: {
    find: "div.item__subtitle",
    take: "normal",
  },
  time: {
    find: "span.item__author__date",
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
