import { Portals } from "@common/constants";
import { Article } from "@resources/dtos";

export interface ScraperService {
  roots: string[];
  name: string;
  link: string;
  type: Portals;
  default: Article;
  links: () => Promise<string[]>;
  scrape: () => Promise<Article[]>;
}
