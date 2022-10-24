import { Portals } from "@common/constants";

export type ScraperConfig = {
  info: {
    roots: string[];
    name: string;
    link: string;
    type: Portals;
    icon: string;
    rss: boolean;
  };
  articles: {
    links: (link: string) => Promise<string[]>;
    id: (link: string) => string;
    remove1: string[];
    title: Cheerio;
    lead: Cheerio;
    author: Cheerio;
    time: Cheerio;
    remove2?: string[] | null;
    content: Cheerio;
  };
};

export type Cheerio = {
  find: string;
  replace: string[];
  take: "first" | "last" | "normal";
};
