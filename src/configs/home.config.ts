import { Portals } from "@/common/enums";
import { ScraperConfig, TLimitedScraperConfig } from "@/common/types";

const HomeConfigPicked: TLimitedScraperConfig = {
  type: Portals.HOME,
  name: "Početna",
  link: "https://portali.pinehood.tech",
  icon: "https://cdn-icons-png.flaticon.com/128/553/553376.png",
};

export const HomeConfig: ScraperConfig = HomeConfigPicked as ScraperConfig;
