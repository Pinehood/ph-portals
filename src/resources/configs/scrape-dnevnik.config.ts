import axios from "@common/axios";
import { Portals, ScraperConfig } from "@root/common";

export const ScrapeDnevnikConfig: ScraperConfig = {
  type: Portals.DNEVNIK,
  name: "Dnevnik",
  link: "https://www.dnevnik.hr",
  icon: "https://dnevnik.hr/favicon.ico",
  rss: false,
  roots: ["https://dnevnik.hr/ajax/loadMore"],
  id: async (link: string) =>
    link.substring(link.lastIndexOf("-") + 1).replace(".html", ""),
  links: async (link: string) => {
    const data =
      "type=ng&boxInfo%5Btype%5D=Frontend_Box_Front_Entity_List&boxInfo%5Bparams%5D%5BuseFrontOptions%5D=&boxInfo%5Bparams%5D%5Bprofile%5D=&boxInfo%5Bparams%5D%5BparamsLoader%5D=&boxInfo%5Bparams%5D%5BallowedContentTypes%5D=article&boxInfo%5Bparams%5D%5Btemplate%5D=frontend%2Fbox%2Ffront%2Fentity%2Fsection-news-dnevnik.twig&boxInfo%5Bparams%5D%5BboxTitle%5D=&boxInfo%5Bparams%5D%5BtargetUrl%5D=&boxInfo%5Bparams%5D%5BcssClass%5D=&boxInfo%5Bparams%5D%5BpreventDuplicates%5D=1&boxInfo%5Bparams%5D%5BshowLoadMore%5D=ajax&boxInfo%5Bparams%5D%5Bsources%5D=subsectionarticles&boxInfo%5Bparams%5D%5Blimits%5D=200&boxInfo%5Bparams%5D%5BeditDescription%5D=&boxInfo%5Bctx%5D%5BsiteId%5D=10&boxInfo%5Bctx%5D%5BsectionId%5D=10001&boxInfo%5Bctx%5D%5BsubsiteId%5D=10004457&boxInfo%5Bctx%5D%5BlayoutDeviceVariant%5D=default&boxInfo%5Bctx%5D%5BlayoutFrontVariant%5D=default";
    const ajaxResponse = await axios.request({
      method: "POST",
      data: data,
      url: link,
      headers: {
        Host: "dnevnik.hr",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    if (ajaxResponse && ajaxResponse.data) {
      return (ajaxResponse.data as string)
        .match(/<a data-upscore-url href="(.*)">/g)
        .map((articleLink) => {
          return (
            "https://www.dnevnik.hr/" +
            articleLink
              .replace('<a data-upscore-url href="', "")
              .replace('">', "")
          );
        })
        .map((articleLink) => articleLink.replace("//", "/"));
    }
  },
  remove1: [
    "img",
    "iframe",
    "figure",
    "picture",
    "div.banner-holder",
    "div.main-media-hodler",
    "div.video-gallery",
    "div.play-buttons",
    "span.related-news",
  ],
  title: {
    find: "h1.title",
    take: "normal",
  },
  lead: {
    find: "p.lead",
    take: "normal",
  },
  time: {
    find: "span.author-time",
    replace: ["Piše"],
    take: "normal",
    transform: (value: string) => value.substring(value.lastIndexOf(",") + 1),
  },
  author: {
    find: "span.author-time",
    replace: ["Piše"],
    take: "normal",
    transform: (value: string) =>
      value.substring(0, value.lastIndexOf(",") - 1),
  },
  content: {
    find: "div.article-body",
  },
};
