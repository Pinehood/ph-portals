import { Portals } from "@/common";
import { Article } from "@/dtos";

export interface ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;
  links: () => Promise<string[]>;
  scrape: () => Promise<Article[]>;
}
