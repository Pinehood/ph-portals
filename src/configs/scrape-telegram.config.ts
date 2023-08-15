import { randomUUID } from "crypto";
import axios from "@/common/axios";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeTelegramConfig: ScraperConfig = {
  type: Portals.TELEGRAM,
  name: "Telegram",
  link: "https://telegram.hr",
  icon: "https://www.telegram.hr/_nuxt/icons/icon_64x64.28ac38.png",
  rss: false,
  roots: [
    "https://www.telegram.hr/api/category/najnovije/page/1",
    "https://www.telegram.hr/api/category/najnovije/page/2",
    "https://www.telegram.hr/api/category/najnovije/page/3",
    "https://www.telegram.hr/api/category/najnovije/page/4",
    "https://www.telegram.hr/api/category/najnovije/page/5",
    "https://www.telegram.hr/api/category/najnovije/page/6",
    "https://www.telegram.hr/api/category/najnovije/page/7",
    "https://www.telegram.hr/api/category/najnovije/page/8",
    "https://www.telegram.hr/api/category/najnovije/page/9",
    "https://www.telegram.hr/api/category/najnovije/page/10",
  ],
  id: () => randomUUID(),
  links: async (link: string) => {
    const articleLinks: string[] = [];
    const list = await axios.get(link);
    if (list && list.data) {
      const obj = JSON.parse(list.data) as {
        category: string;
        description: string;
        posts: any[];
      };
      if (obj && obj.posts && obj.posts.length > 0) {
        for (let i = 0; i < obj.posts.length; i++) {
          const post = obj.posts[i];
          let articleLink = post.permalink;
          if (!articleLink.startsWith("http")) {
            if (!articleLink.startsWith("/")) {
              articleLink = `https://www.telegram.hr/${articleLink}`;
            } else {
              articleLink = `https://www.telegram.hr${articleLink}`;
            }
          }
          if (articleLinks.findIndex((el) => el == articleLink) == -1) {
            articleLinks.push(articleLink);
          }
        }
      }
    }
    return articleLinks;
  },
  remove1: ["img", "figure", "iframe", 'div[id="intext_premium"]', "div.lwdgt"],
  title: {
    find: "h1.full",
  },
  lead: {
    find: "h2.full",
  },
  time: {
    find: "div.full.column.article-head.column-top-pad.flex > h5:nth-child(6) > span",
    take: "first",
  },
  author: {
    find: "div.full.column.article-head.column-top-pad.flex > h5:nth-child(6) > a:nth-child(2) > span.vcard.author",
    take: "first",
  },
  content: {
    find: 'div[id="article-content"]',
  },
};
