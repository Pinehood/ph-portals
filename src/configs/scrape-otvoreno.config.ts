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
      value.replace("Objavio", "").replace("Objavila", ""),
  },
  content: {
    find: "div.td-post-content",
  },
};
