import { CheerioExtractor, ScraperConfig } from "@/common";
import { Article } from "@/dtos";

export class TransformService {
  static article(article: Article, config: ScraperConfig): void {
    article.title = TransformService.single(article.title, config.title);
    article.lead = TransformService.single(article.lead, config.lead);
    article.time = TransformService.single(article.time, config.time);
    article.author = TransformService.single(article.author, config.author);
    if (article.content) {
      article.content = article.content.replace(/\n/g, "");
    }
  }

  static single(value: string, extractor: CheerioExtractor): string {
    try {
      let finalValue = value;
      if (finalValue) {
        finalValue = finalValue.replace(/\n/g, "").replace(/  /g, "").trim();
        if (extractor.transform) {
          finalValue = extractor.transform(finalValue);
        }
      }
      return finalValue;
    } catch {
      return "";
    }
  }
}
