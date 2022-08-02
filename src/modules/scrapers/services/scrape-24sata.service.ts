import { Injectable } from "@nestjs/common";
import { Article } from "@modules/common";
import { ScraperService } from "@scrapers/services/scraper.service";
import * as superagent from "superagent";
import * as cheerio from "cheerio";
@Injectable()
export class Scrape24SataService implements ScraperService {
  rootLinks: string[];
  name: string;
  link: string;
  /*  "https://www.24sata.hr" */
  constructor() {
    this.name = "24sata";
    this.link = "https://www.24sata.hr/flatpages/rss/";
    this.rootLinks = []; //ili RSS XML linkovi pa ćupaš <link> elemente i ulaziš, ili je html stranica pa odmah parse-aš <a> i slično
  }

  async scrape(): Promise<Article[]> {
    const feed = await superagent.get(this.link);
    const $ = cheerio.load(feed.text); /* 
    const mainDiv = $(".flatpage__content").html(); */
    const test = $("script");
    console.log(test.length);
    test.each((idx, el) => {
      console.log($(el).text());
    });
    //JS import: const Nesto = require("nesto");
    //TS import of JS: import Nest from "nest";
    //TS import of JS: import * as Nest from "nest":
    return null;
  }
}
