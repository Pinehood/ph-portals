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
  id: () => Math.floor(100000000 + Math.random() * 900000000).toString(),
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
          const articleLink = "https://www.telegram.hr" + post.permalink;
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
    take: "normal",
  },
  lead: {
    find: "h2.full",
    take: "normal",
  },
  time: {
    find: "span.meta-date",
    take: "normal",
  },
  author: {
    find: "a.meta-author",
    take: "normal",
  },
  content: {
    find: 'div[id="article-content"]',
  },
};
