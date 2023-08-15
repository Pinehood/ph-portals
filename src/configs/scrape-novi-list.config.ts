import { randomUUID } from "crypto";
import axios from "@/common/axios";
import { Portals } from "@/common/enums";
import { ScraperConfig } from "@/common/types";

export const ScrapeNoviListConfig: ScraperConfig = {
  type: Portals.NOVI_LIST,
  name: "Novi List",
  link: "https://www.novilist.hr/",
  icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Novi_list_Logo.svg/2560px-Novi_list_Logo.svg.png",
  rss: false,
  roots: [
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=1&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=2&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=3&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=4&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=5&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=6&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=7&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=8&type=category",
    "https://www.novilist.hr/wp-json/wp/ea/posts?_wpnonce=d3121e95ff&per_page=50&cat=9&type=category",
  ],
  id: () => randomUUID(),
  links: async (link: string) => {
    const articleLinks: string[] = [];
    const list = await axios.get(link);
    if (list && list.data) {
      const obj = JSON.parse(list.data) as {
        posts: any[];
      };
      if (obj && obj.posts && obj.posts.length > 0) {
        for (let i = 0; i < obj.posts.length; i++) {
          const post = obj.posts[i];
          let articleLink = post.permalink;
          if (!articleLink.startsWith("http")) {
            if (!articleLink.startsWith("/")) {
              articleLink = `https://www.novilist.hr/${articleLink}`;
            } else {
              articleLink = `https://www.novilist.hr${articleLink}`;
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
  remove1: ["img", "figure", "iframe", "div.lwdgt", "div.linked-news"],
  title: {
    find: "h1.article-title",
  },
  lead: {
    find: "p.intro-text",
  },
  time: {
    find: "p.article-date",
  },
  author: {
    find: "p.editor-name",
  },
  content: {
    find: "div.user-content",
  },
};
