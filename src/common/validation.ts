import { Article } from "@/dtos";

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
    return true;
  } catch {
    return false;
  }
}
