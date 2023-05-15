import axios from "@/common/axios";
import { Portals, ScraperConfig } from "@/common";

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
  id: (link: string) =>
    link.substring(link.lastIndexOf("-") + 1).replace("/", ""),
  links: async (link: string) => {
    const rss = await axios.get(link);
    if (rss && rss.data) {
      return (rss.data as string)
        .match(/<link>(.*?)<\/link>/g)
        .map((articleLink) =>
          articleLink.replace("<link>", "").replace("</link>", "")
        )
        .filter((articleLink) => articleLink.includes("-"));
    }
  },
  remove1: ["img", "iframe", "div.banner"],
  title: {
    find: "h1.pd-title",
    take: "normal",
  },
  lead: {
    find: "div.pd-short-desc",
    take: "normal",
  },
  time: {
    find: "div.pd-date",
    take: "normal",
  },
  author: {
    find: "p.pd-author-name",
    take: "normal",
  },
  content: {
    find: "div.pd-desc",
  },
};
