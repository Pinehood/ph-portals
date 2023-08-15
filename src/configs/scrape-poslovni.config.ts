import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapePoslovniConfig: ScraperConfig = {
  type: Portals.POSLOVNI,
  name: "Poslovni",
  link: "https://www.poslovni.hr",
  icon: "https://www.poslovni.hr/wp-content/themes/poslovni/static/img/fav/favicon-32x32.png",
  rss: false,
  roots: [
    "https://www.poslovni.hr/vijesti/hrvatska",
    "https://www.poslovni.hr/vijesti/regija",
    "https://www.poslovni.hr/vijesti/europska-unija",
    "https://www.poslovni.hr/vijesti/svijet",
    "https://www.poslovni.hr/sci-tech",
    "https://www.poslovni.hr/kompanije",
    "https://www.poslovni.hr/financije",
    "https://www.poslovni.hr/lifestyle",
  ],
  linker: "article a",
  remove1: ["img", "iframe", "figure", "picture", "div.lwdgt"],
  title: {
    find: "h1.title",
  },
  lead: {
    find: "div.single__lead",
  },
  time: {
    find: "span.text",
    take: "first",
    transform: (value: string) => value.replace(",", ""),
  },
  author: {
    find: "a.single__meta-author",
  },
  content: {
    find: "div.article__content",
  },
};
