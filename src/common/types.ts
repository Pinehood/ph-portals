import { Portals } from "@/common/enums";

export type ScraperConfig = {
  type: Portals;
  name: string;
  link: string;
  icon: string;
  rss: boolean;
  roots: string[];
  linker?: string;
  links?: (link: string) => Promise<string[]>;
  id?: (link: string) => string;
  remove1: string[];
  title: Cheerio;
  lead: Cheerio;
  author: Cheerio;
  time: Cheerio;
  remove2?: string[] | null;
  content: CheerioLimited;
};

type Cheerio = {
  find: string;
  replace?: string[] | null;
  take: "first" | "last" | "normal";
  transform?: (value: string) => string;
};

type CheerioLimited = Omit<Cheerio, "take" | "transform">;
