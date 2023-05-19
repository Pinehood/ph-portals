import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const Scrape24SataConfig: ScraperConfig = {
  type: Portals.SATA24,
  name: "24sata",
  link: "https://www.24sata.hr",
  icon: "https://24sata.hr/favicon.ico",
  rss: true,
  roots: [
    "https://www.24sata.hr/feeds/aktualno.xml",
    "https://www.24sata.hr/feeds/najnovije.xml",
    "https://www.24sata.hr/feeds/news.xml",
    "https://www.24sata.hr/feeds/sport.xml",
    "https://www.24sata.hr/feeds/show.xml",
    "https://www.24sata.hr/feeds/lifestyle.xml",
    "https://www.24sata.hr/feeds/tech.xml",
    "https://www.24sata.hr/feeds/fun.xml",
  ],
  remove1: ["img", "iframe"],
  title: {
    find: "h1.article__title",
    take: "normal",
  },
  lead: {
    find: "p.article__lead_text",
    take: "normal",
  },
  time: {
    find: "time.article__time",
    take: "normal",
  },
  author: {
    find: "span.article__authors_item",
    replace: ["Piše"],
    take: "normal",
    transform: (value: string) => value.substring(0, value.length - 1),
  },
  content: {
    find: "div.article__content",
    replace: ["<h3>Najčitaniji članci</h3>"],
  },
};
