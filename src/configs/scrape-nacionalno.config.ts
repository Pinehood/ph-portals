import { randomUUID } from "crypto";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeNacionalnoConfig: ScraperConfig = {
  type: Portals.NACIONALNO,
  name: "Nacionalno",
  link: "https://nacionalno.hr",
  icon: "https://www.nacionalno.hr/wp-content/uploads/2020/10/Favicon-1.png",
  rss: false,
  roots: [
    "https://www.nacionalno.hr/tema/vijesti",
    "https://www.nacionalno.hr/tema/vijesti/page/2",
    "https://www.nacionalno.hr/tema/vijesti/page/3",
    "https://www.nacionalno.hr/tema/svijet",
    "https://www.nacionalno.hr/tema/svijet/page/2",
    "https://www.nacionalno.hr/tema/svijet/page/3",
    "https://www.nacionalno.hr/tema/sport",
    "https://www.nacionalno.hr/tema/sport/page/2",
    "https://www.nacionalno.hr/tema/sport/page/3",
  ],
  id: () => randomUUID(),
  linker: "div.td-module-meta-info > h3 > a",
  remove1: ["img", "iframe", "div.lwdgt", "div.wpipa-container"],
  title: {
    find: "h1.entry-title",
  },
  lead: {
    find: "div.td-post-content > p:nth-child(1)",
  },
  time: {
    find: "time.entry-date",
  },
  author: {
    find: "figcaption.wp-caption-text",
    transform: (value: string) =>
      value.replace("Izvor; ", "").replace("Izvor: ", ""),
  },
  remove2: ["div.td-post-featured-image", "figure", "figcaption"],
  content: {
    find: "div.td-post-content",
  },
};
