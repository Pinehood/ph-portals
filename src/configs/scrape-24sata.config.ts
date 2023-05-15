import axios from "@/common/axios";
import { Portals, ScraperConfig } from "@/common";

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
  id: (link: string) => link.substring(link.lastIndexOf("-") + 1),
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
