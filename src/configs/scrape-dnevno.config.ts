import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeDnevnoConfig: ScraperConfig = {
  type: Portals.DNEVNO,
  name: "Dnevno",
  link: "https://www.dnevno.hr",
  icon: "https://dnevno.hr/favicon.ico",
  rss: false,
  roots: [
    "https://www.dnevno.hr/category/vijesti",
    "https://www.dnevno.hr/category/sport",
    "https://www.dnevno.hr/category/magazin",
    "https://www.dnevno.hr/category/gospodarstvo-i-turizam",
    "https://www.dnevno.hr/category/planet-x",
    "https://www.dnevno.hr/category/zdravlje",
    "https://www.dnevno.hr/category/domovina",
    "https://www.dnevno.hr/category/vjera",
  ],
  linker: "article.post a",
  remove1: [
    "img",
    "iframe",
    "div.wpipa-container",
    "div.lwdgt-container",
    "p.lwdgt-logo",
    "center",
    "blockquote",
    "figure",
    "figcaption",
  ],
  title: {
    find: "h1",
  },
  lead: {
    find: "a.title",
  },
  time: {
    find: "time.date",
    take: "first",
    transform: (value: string) => {
      const split = value.split(",");
      if (split && split.length > 1) {
        const day = split[0].trim();
        const date = split[1].replace(day, "").trim();
        return (day + ", " + date).trim();
      }
      return "";
    },
  },
  author: {
    find: "span.author",
    take: "first",
    transform: (value: string) => value.split("Autor:")[1],
  },
  remove2: [
    "div.img-holder",
    "div.heading",
    "h1",
    "style",
    "div.info",
    "div.info-holder",
  ],
  content: {
    find: "section.description",
  },
};
