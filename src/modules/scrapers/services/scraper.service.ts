import { Article } from "@modules/common";

export interface ScraperService {
  rootLinks: string[];
  name: string;
  link: string;
  scrape: () => Promise<Article[]>;
}
