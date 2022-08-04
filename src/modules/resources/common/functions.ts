import { Article } from "@resources/dtos";
import { Portals } from "@resources/common/constants";

export function getPortalsLinks(portal: Portals): string {
  try {
    const linkTemplateHtml = `<a href="/portals/@portal@" class="@active@item">@name@</a>`;
    let linksHtml = "";
    Object.keys(Portals).forEach((value) => {
      let linkHtml = linkTemplateHtml
        .replace("@portal@", Portals[value])
        .replace("@name@", getPortalName(Portals[value]));
      if (Portals[value] == portal) {
        linkHtml = linkHtml.replace("@active@", "active ");
      } else {
        linkHtml = linkHtml.replace("@active@", "");
      }
      linksHtml += linkHtml;
    });
    return linksHtml;
  } catch (error: any) {
    console.log(error);
    return "";
  }
}

export function getPortalName(portal: Portals): string {
  if (portal == Portals.HOME) return "Početna";
  else if (portal == Portals.SATA24) return "24sata";
  else if (portal == Portals.INDEX) return "Index";
  else if (portal == Portals.VECERNJI) return "Večernji";
  else if (portal == Portals.JUTARNJI) return "Jutarnji";
  else if (portal == Portals.NET) return "Net";
  else if (portal == Portals.DNEVNIK) return "Dnevnik";
  else if (portal == Portals.DNEVNO) return "Dnevno";
  else if (portal == Portals.TPORTAL) return "Tportal";
  else if (portal == Portals.SLOBODNA_DALMACIJA) return "Slobodna Dalmacija";
  else if (portal == Portals.SPORTSKE_NOVOSTI) return "Sportske Novosti";
  else return "";
}

export function isValidArticle(article: Article): boolean {
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

export function shouldArticleBeDisplayed(article: Article): boolean {
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
