import { Portals } from "@resources/common";
import { Article } from "@resources/dtos";

export interface ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;
  articleLinks: () => Promise<string[]>;
  scrape: () => Promise<Article[]>;
}
