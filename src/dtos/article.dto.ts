import { ArticleInfo } from "@/dtos/article-info.dto";

export class Article extends ArticleInfo {
  portalType: string;
  backLink: string;
  html: string;
}
