import { Article } from "@resources/dtos";

export interface ScraperService {
  rootLinks: string[];
  name: string;
  link: string;
  scrape: () => Promise<Article[]>;
  defaultArticle: () => Article;
}
