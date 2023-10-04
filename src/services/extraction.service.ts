import { randomUUID } from "crypto";
import * as cheerio from "cheerio";
import { CheerioExtractor } from "@/common";

export class ExtractionService {
  static id(link: string): string {
    try {
      return link
        .substring(link.lastIndexOf("-") + 1)
        .replace("/", "")
        .replace(".html", "");
    } catch {
      return randomUUID();
    }
  }

  static cheerio($: cheerio.CheerioAPI, extractor: CheerioExtractor): string {
    try {
      return extractor.take == "first"
        ? $(extractor.find).first().text()
        : extractor.take == "last"
        ? $(extractor.find).last().text()
        : $(extractor.find).text();
    } catch {
      return "";
    }
  }
}
