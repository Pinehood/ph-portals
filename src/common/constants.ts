import {
  HomeConfig,
  Scrape24SataConfig,
  ScrapeDanasConfig,
  ScrapeDirektnoConfig,
  ScrapeDnevnikConfig,
  ScrapeDnevnoConfig,
  ScrapeIndexConfig,
  ScrapeJutarnjiConfig,
  ScrapeN1InfoConfig,
  ScrapeNacionalConfig,
  ScrapeNacionalnoConfig,
  ScrapeNetConfig,
  ScrapeNoviListConfig,
  ScrapeOtvorenoConfig,
  ScrapePoslovniConfig,
  ScrapeSlobodnaDalmacijaConfig,
  ScrapeSportskeNovostiConfig,
  ScrapeTelegramConfig,
  ScrapeTportalConfig,
  ScrapeVecernjiConfig,
  ScrapeZagrebConfig,
} from "@/configs";
import { Portals } from "@/common/enums";
import { disabled } from "./formatting";

export const PORTAL_SCRAPERS = {
  [Portals.HOME]: HomeConfig,
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
  [Portals.TELEGRAM]: disabled(ScrapeTelegramConfig), // JSON wrapped in HTML, weird
  [Portals.TPORTAL]: ScrapeTportalConfig,
  [Portals.VECERNJI]: ScrapeVecernjiConfig,
  [Portals.ZAGREB]: disabled(ScrapeZagrebConfig), // CloudFlare protection triggered
  [Portals.NOVI_LIST]: ScrapeNoviListConfig,
  [Portals.N1_INFO]: ScrapeN1InfoConfig,
  [Portals.NACIONAL]: ScrapeNacionalConfig,
  [Portals.NACIONALNO]: disabled(ScrapeNacionalnoConfig), // site under construction
  [Portals.OTVORENO]: disabled(ScrapeOtvorenoConfig), // CloudFlare protection triggered
} as const;
