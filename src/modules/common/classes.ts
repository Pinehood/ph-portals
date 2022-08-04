import { Portals } from "./constants";

export class ArticleListItem {
  title: string;
  lead: string;
  link: string;
  portal: string;
  articleId: string;
}

export class Article {
  portalType: string;
  portalName: string;
  portalLink: string;
  backLink: string;
  articleId: string;
  articleLink: string;
  title: string;
  lead: string;
  content: string;
  author: string;
  time: string;

  public static isValid(article: Article): boolean {
    try {
      return (
        article.title.length > 0 &&
        article.lead.length > 0 &&
        article.content.length > 0 &&
        article.author.length > 0 &&
        article.time.length > 0
      );
    } catch {
      return false;
    }
  }

  public static shouldBeDisplayed(article: Article): boolean {
    try {
      switch (article.portalType) {
        case Portals.SATA24: {
          if (
            article.title.toLowerCase().includes("igraj i osvoji") ||
            article.title.toLowerCase().includes("osvojite") ||
            article.title.toLowerCase().includes("kupon") ||
            article.title.toLowerCase().includes("prijavi se")
          ) {
            return false;
          }

          if (
            article.author.toLowerCase().includes("promo") ||
            article.author.toLowerCase().includes("sponzor") ||
            article.author.toLowerCase().includes("plaćeni") ||
            article.author.toLowerCase().includes("oglas")
          ) {
            return false;
          }

          if (
            article.content
              .toLowerCase()
              .includes("pravila korištenja osobnih podataka") ||
            article.content.toLowerCase().includes("pravila privatnosti") ||
            article.content.toLowerCase().includes("prijavi se")
          ) {
            return false;
          }
          break;
        }

        case Portals.JUTARNJI: {
          if (
            article.articleId.toLowerCase().includes("https:--") ||
            article.articleId.toLowerCase().includes("-vijesti-zagreb")
          ) {
            return false;
          }
          break;
        }

        case Portals.VECERNJI: {
          if (article.author.toLowerCase().includes("pr članak")) {
            return false;
          }
          break;
        }

        case Portals.NET: {
          if (article.articleId.toLowerCase().includes("https:")) {
            return false;
          }
          break;
        }

        default: {
          if (article.author) {
            return article.author.length > 0;
          } else {
            return false;
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}
