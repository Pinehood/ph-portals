import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeDirektnoConfig: ScraperConfig = {
  type: Portals.DIREKTNO,
  name: "Direktno",
  link: "https://www.direktno.hr",
  icon: "https://direktno.hr/favicon-32x32.png",
  rss: true,
  roots: [
    "https://direktno.hr/rss/publish/latest/direkt-50",
    "https://direktno.hr/rss/publish/latest/domovina-10",
    "https://direktno.hr/rss/publish/latest/zagreb-15",
    "https://direktno.hr/rss/publish/latest/eu_svijet",
    "https://direktno.hr/rss/publish/latest/razvoj-110",
    "https://direktno.hr/rss/publish/latest/sport-60",
    "https://direktno.hr/rss/publish/latest/zivot-70",
    "https://direktno.hr/rss/publish/latest/kolumne-80",
    "https://direktno.hr/rss/publish/latest/medijski-partneri-90",
  ],
  remove1: ["img", "iframe", "div.banner", "em"],
  title: {
    find: "h1.pd-title",
  },
  lead: {
    find: "div.pd-short-desc",
  },
  time: {
    find: "div.pd-date",
  },
  author: {
    find: "p.pd-author-name",
  },
  content: {
    find: "div.pd-desc",
  },
};
