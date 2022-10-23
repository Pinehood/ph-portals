import { PinoLogger } from "nestjs-pino";
import { Article } from "@resources/dtos";
import { Portals } from "@resources/common/constants";
import { PortalsRoutes } from "@resources/common/routes";
import { ResponseConstants } from ".";

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
      article.content.length > 0 &&
      article.author.length > 0
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
          article.author &&
          (article.author.toLowerCase().includes("promo") ||
            article.author.toLowerCase().includes("sponzor") ||
            article.author.toLowerCase().includes("plaćeni") ||
            article.author.toLowerCase().includes("oglas"))
        ) {
          return false;
        }

        if (
          article.content &&
          (article.content
            .toLowerCase()
            .includes("pravila korištenja osobnih podataka") ||
            article.content.toLowerCase().includes("pravila privatnosti") ||
            article.content.toLowerCase().includes("prijavi se"))
        ) {
          return false;
        }
        break;
      }

      case Portals.JUTARNJI: {
        if (
          article.articleId &&
          (article.articleId.toLowerCase().includes("https:--") ||
            article.articleId.toLowerCase().includes("-vijesti-zagreb"))
        ) {
          return false;
        }
        break;
      }

      case Portals.VECERNJI: {
        if (
          article.author &&
          article.author.toLowerCase().includes("pr članak")
        ) {
          return false;
        }
        break;
      }

      case Portals.NET: {
        if (
          article.articleId &&
          article.articleId.toLowerCase().includes("https:")
        ) {
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

export function redirect(portal: Portals): string {
  try {
    return ResponseConstants.REDIRECT.replace(
      "@redurl@",
      `${PortalsRoutes.BASE}/${portal}`
    );
  } catch {
    return `${PortalsRoutes.BASE}/home`;
  }
}

export function formatDate(date: Date): string {
  return (
    ("0" + date.getUTCDate()).slice(-2) +
    "." +
    ("0" + (date.getUTCMonth() + 1)).slice(-2) +
    "." +
    date.getUTCFullYear() +
    "." +
    ("0" + date.getUTCHours()).slice(-2) +
    ":" +
    ("0" + date.getUTCMinutes()).slice(-2) +
    ":" +
    ("0" + date.getUTCSeconds()).slice(-2)
  );
}

export function millisToMinutesAndSeconds(millis: number) {
  const minutes = Math.floor(millis / 60000);
  const seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + "m" + (seconds < 10 ? "0" : "") + seconds + "s";
}

export function getDefaultArticle(
  type: Portals,
  link: string,
  name: string
): Article {
  return {
    articleId: "",
    articleLink: "",
    author: "",
    backLink: `${PortalsRoutes.BASE}/${type}`,
    content: "",
    lead: "",
    portalLink: link,
    portalName: name,
    portalType: type,
    time: "",
    title: "",
    html: "",
  };
}

export async function TryCatch(
  logger: PinoLogger,
  link: string,
  action: () => Promise<void>
): Promise<void> {
  try {
    await action();
  } catch (error: any) {
    if (
      error.response &&
      error.response.status &&
      error.response.status >= 400
    ) {
      logger.error(
        "Failed to retrieve data for link '%s' with status code '%d'",
        link,
        error.response.status
      );
    } else {
      logger.error("Failed to retrieve data for link '%s'", link);
    }
  }
}
