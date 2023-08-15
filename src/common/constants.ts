import {
  Scrape24SataConfig,
  ScrapeDanasConfig,
  ScrapeDirektnoConfig,
  ScrapeDnevnikConfig,
  ScrapeDnevnoConfig,
  ScrapeIndexConfig,
  ScrapeJutarnjiConfig,
  ScrapeNetConfig,
  ScrapePoslovniConfig,
  ScrapeSlobodnaDalmacijaConfig,
  ScrapeSportskeNovostiConfig,
  ScrapeTelegramConfig,
  ScrapeTportalConfig,
  ScrapeVecernjiConfig,
  ScrapeZagrebConfig,
} from "@/configs";
import { Portals } from "@/common/enums";
import { ScrapeNoviListConfig } from "@/configs/scrape-novi-list.config";

export const PORTAL_SCRAPERS = {
  [Portals.DANAS]: ScrapeDanasConfig,
  [Portals.DIREKTNO]: ScrapeDirektnoConfig,
  [Portals.DNEVNIK]: ScrapeDnevnikConfig,
  [Portals.DNEVNO]: ScrapeDnevnoConfig,
  [Portals.INDEX]: ScrapeIndexConfig,
  [Portals.JUTARNJI]: ScrapeJutarnjiConfig,
  [Portals.NET]: ScrapeNetConfig,
  [Portals.POSLOVNI]: ScrapePoslovniConfig,
  [Portals.SATA24]: Scrape24SataConfig,
  [Portals.SLOBODNA_DALMACIJA]: ScrapeSlobodnaDalmacijaConfig,
  [Portals.SPORTSKE_NOVOSTI]: ScrapeSportskeNovostiConfig,
  [Portals.TELEGRAM]: ScrapeTelegramConfig,
  [Portals.TPORTAL]: ScrapeTportalConfig,
  [Portals.VECERNJI]: ScrapeVecernjiConfig,
  [Portals.ZAGREB]: ScrapeZagrebConfig,
  [Portals.NOVI_LIST]: ScrapeNoviListConfig,
} as const;
