import { Injectable } from "@nestjs/common";
import { Article } from "@modules/common";
import { ScraperService } from "@scrapers/services/scraper.service";

@Injectable()
export class Scrape24SataService implements ScraperService {
  rootLinks: string[];
  name: string;
  link: string;

  constructor() {
    this.name = "24sata";
    this.link = "https://www.24sata.hr";
    this.rootLinks = []; //ili RSS XML linkovi pa ćupaš <link> elemente i ulaziš, ili je html stranica pa odmah parse-aš <a> i slično
  }

  async scrape(): Promise<Article[]> {
    //JS import: const Nesto = require("nesto");
    //TS import of JS: import Nest from "nest";
    //TS import of JS: import * as Nest from "nest":
    return null;
  }
}
