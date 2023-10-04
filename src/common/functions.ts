import { Article } from "@/dtos";
import { Params, Portals } from "@/common/enums";
import { PortalsRoutes } from "@/common/routes";

export function getDefaultArticle(
  type: Portals,
  link: string,
  name: string,
): Article {
  return {
    articleId: "",
    articleLink: "",
    author: "",
    backLink: PortalsRoutes.PORTAL.replace(`:${Params.PORTAL}`, type),
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
    if (!link) {
      console.error(error);
    }
  }
}
