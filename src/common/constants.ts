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
} as const;

export const GTAG_HTML = `
  <!-- Google tag (gtag.js) -->
  <script
    async
    src="https://www.googletagmanager.com/gtag/js?id=@gtid@"
  ></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "@gtid@");
  </script>
` as const;
