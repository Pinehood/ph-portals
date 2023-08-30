import { randomUUID } from "crypto";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeOtvorenoConfig: ScraperConfig = {
  type: Portals.OTVORENO,
  name: "Otvoreno",
  link: "https://otvoreno.hr",
  icon: "https://otvoreno.hr/wp-content/uploads/2019/11/Otvoreno_favicon.jpg",
  rss: false,
  roots: [
    "https://www.otvoreno.hr/najnovije",
    "https://www.otvoreno.hr/category/gospodarstvo/energetika",
    "https://www.otvoreno.hr/category/gospodarstvo/novac",
    "https://www.otvoreno.hr/category/kultura/dogadanja",
    "https://www.otvoreno.hr/category/sport",
    "https://www.otvoreno.hr/category/eu-i-svijet",
  ],
  id: () => randomUUID(),
  linker: "div > h3 > a",
  remove1: [
    "img",
    "iframe",
    "div.wpipa-198640-container",
    "div.wpipa-198641-container",
    "div.wpipa-container",
    "video",
    "div.under-article-ads",
    "div.td-post-sharing-bottom",
    "div.fb-comments",
    "div.td-post-featured-image",
    "figure",
    "figcaption",
  ],
  title: {
    find: "h1.entry-title",
  },
  lead: {
    find: "div.td-post-content > p:nth-child(3)",
    take: "first",
  },
  time: {
    find: "time.entry-date",
  },
  author: {
    find: "div.td-post-author-name",
    transform: (value: string) =>
      value
        .substring(0, value.length - 1)
        .replace("Objavio", "")
        .replace("Objavila", ""),
  },
  remove2: ["h3"],
  content: {
    find: "div.td-post-content",
  },
};
