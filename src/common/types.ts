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
  title: CheerioExtractor;
  lead: CheerioExtractor;
  author: CheerioExtractor;
  time: CheerioExtractor;
  remove2?: string[] | null;
  content: CheerioExtractorSimple;
};

type CheerioExtractor = {
  find: string;
  take?: "first" | "last" | "normal";
  transform?: (value: string) => string;
};

type CheerioExtractorSimple = Omit<CheerioExtractor, "take" | "transform">;
