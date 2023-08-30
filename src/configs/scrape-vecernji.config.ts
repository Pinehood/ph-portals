import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeVecernjiConfig: ScraperConfig = {
  type: Portals.VECERNJI,
  name: "Večernji",
  link: "https://www.vecernji.hr",
  icon: "https://vecernji.hr/favicon.ico",
  rss: false,
  roots: [
    "https://www.vecernji.hr/hrvatska",
    "https://www.vecernji.hr/crna-kronika",
    "https://www.vecernji.hr/svijet",
    "https://www.vecernji.hr/sport",
    "https://www.vecernji.hr/zagreb",
    "https://www.vecernji.hr/showbiz",
    "https://www.vecernji.hr/biznis",
    "https://www.vecernji.hr/techsci",
    "https://www.vecernji.hr/znanost",
    "https://www.vecernji.hr/zanimljivosti",
  ],
  linker: "a.card__link",
  remove1: [
    "img",
    "iframe",
    "span.widgetWrap",
    "div.article__body_banner_article_bottom",
    "div.image",
    "div.dfp_banner--divInArticle",
    "div.js_bannerInArticle2",
    "div.js_bannerInArticle",
  ],
  title: {
    find: "h1.single-article__title",
  },
  lead: {
    find: "div.single-article__headline",
    take: "first",
  },
  time: {
    find: "div.single-article__inner > div > div > div:nth-child(2) > div > div:nth-child(2)",
    transform: (value: string) => value.replace("u ", " u "),
  },
  author: {
    find: "div.author__name",
    transform: (value: string) => value.replace("Autor", ""),
  },
  remove2: ["div.single-article__row", "div.single-article__row--full"],
  content: {
    find: "div.single-article__content",
  },
};
