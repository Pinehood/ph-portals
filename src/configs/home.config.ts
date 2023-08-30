import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const HomeConfig: ScraperConfig = {
  type: Portals.HOME,
  name: "Početna",
  link: "https://portali.pinehood.tech",
  icon: "https://cdn-icons-png.flaticon.com/128/553/553376.png",
  rss: false,
  roots: [],
  remove1: [],
  title: {
    find: "",
  },
  lead: {
    find: "",
  },
  time: {
    find: "",
  },
  author: {
    find: "",
  },
  content: {
    find: "",
  },
};
