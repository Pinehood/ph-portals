import { Portals } from "@common/constants";

export type ScraperConfig = {
  type: Portals;
  name: string;
  link: string;
  icon: string;
  rss: boolean;
  roots: string[];
  links: (link: string) => Promise<string[]>;
  id: (link: string) => Promise<string>;
  remove1: string[];
  title: Cheerio;
  lead: Cheerio;
  author: Cheerio;
  time: Cheerio;
  remove2?: string[] | null;
  content: Omit<Omit<Cheerio, "take">, "transform">;
};

export type Cheerio = {
  find: string;
  replace?: string[] | null;
  take: "first" | "last" | "normal";
  transform?: (value: string) => string;
};
