import { Article } from "@resources/dtos";
import { Portals } from "@common/constants";
import { ResponseConstants } from ".";

export function getPortalsLinks(portal: Portals): string {
  try {
    const linkTemplateHtml = `<a href="/portals/@portal@" class="@active@item" title="@name@"><img src="@link@" style="max-width:16px;max-height:16px;margin:auto;"/></a>`;
    let linksHtml = "";
    Object.keys(Portals).forEach((value) => {
      let linkHtml = linkTemplateHtml
        .replace("@portal@", Portals[value])
        .replace("@link@", getPortalIcon(Portals[value]))
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

export function getPortalIcon(portal: Portals): string {
  if (portal == Portals.HOME)
    return "https://cdn-icons-png.flaticon.com/128/553/553376.png";
  else if (portal == Portals.SATA24) return "https://24sata.hr/favicon.ico";
  else if (portal == Portals.INDEX) return "https://index.hr/favicon.ico";
  else if (portal == Portals.VECERNJI) return "https://vecernji.hr/favicon.ico";
  else if (portal == Portals.JUTARNJI)
    return "https://www.jutarnji.hr/templates/site/images/pngs/favicon-jl/android-chrome-192x192.png";
  else if (portal == Portals.NET)
    return "https://cdn.net.hr/favicon/favicon-32x32.png";
  else if (portal == Portals.DNEVNIK) return "https://dnevnik.hr/favicon.ico";
  else if (portal == Portals.DNEVNO) return "https://dnevno.hr/favicon.ico";
  else if (portal == Portals.TPORTAL) return "https://tportal.hr/favicon.ico";
  else if (portal == Portals.SLOBODNA_DALMACIJA)
    return "https://slobodnadalmacija.hr/templates/site/images/pngs/favicon-sd/favicon-32x32.png";
  else if (portal == Portals.SPORTSKE_NOVOSTI)
    return "https://sportske.jutarnji.hr/templates/site/images/pngs/favicon-sn/android-icon-192x192.png";
  else
    return "https://static.vecteezy.com/system/resources/thumbnails/000/365/820/small/Basic_Elements__2818_29.jpg";
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
  else return "N/A";
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
        article.author.toLowerCase().includes("oglas") ||
        article.author.toLowerCase().includes("pr članak"))
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

    if (article.author) {
      return article.author.length > 0;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export function redirect(portal: Portals): string {
  try {
    return ResponseConstants.REDIRECT.replace("@redurl@", `/portals/${portal}`);
  } catch {
    return `/portals/home`;
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
    backLink: `/portals/${type}`,
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

export async function TryCatch(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error: any) {
    const link =
      error && error.config && error.config.url ? error.config.url : null;
    if (link) {
      console.warn("Failed to retrieve data for link '%s'", link);
    } else {
      console.error(error);
    }
  }
}