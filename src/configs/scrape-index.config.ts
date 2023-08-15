import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeIndexConfig: ScraperConfig = {
  type: Portals.INDEX,
  name: "Index",
  link: "https://www.index.hr",
  icon: "https://index.hr/favicon.ico",
  rss: true,
  roots: [
    "https://www.index.hr/rss",
    "https://www.index.hr/rss/vijesti",
    "https://www.index.hr/rss/vijesti-svijet",
    "https://www.index.hr/rss/najcitanije",
    "https://www.index.hr/rss/sport",
    "https://www.index.hr/rss/magazin",
  ],
  id: (link: string) =>
    link.substring(link.lastIndexOf("/") + 1).replace(".aspx", ""),
  remove1: ["img", "iframe", "div.js-slot-container", "div.brid"],
  title: {
    find: "h1.title",
    take: "normal",
  },
  lead: {
    find: "div.text p",
    take: "first",
    transform: (value: string) => value.split(".")[0],
  },
  time: {
    find: "div.flex-1",
    take: "last",
    transform: (value: string) => value.split("|")[1],
  },
  author: {
    find: "div.flex-1",
    take: "first",
    transform: (value: string) => value.split("|")[0],
  },
  content: {
    find: "div.text",
    replace: [
      "USKORO OPŠIRNIJE",
      "Znate li nešto više o temi ili želite prijaviti grešku u tekstu",
    ],
  },
};
