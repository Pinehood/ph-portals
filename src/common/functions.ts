import { Article } from "@/dtos";
import { Params, Portals } from "@/common/enums";
import { PortalsRoutes } from "@/common/routes";

export function getDefaultArticle(
  type: Portals,
  link: string,
  name: string
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

export function calculateApproximateMapMemoryUsage(
  map: Map<string, any>
): number {
  let memoryUsage = 0;
  memoryUsage += 64;
  for (const key of map.keys()) {
    memoryUsage += 2 * key.length;
  }
  for (const value of map.values()) {
    if (typeof value == "number") {
      memoryUsage += 8;
    } else if (typeof value == "string") {
      memoryUsage += 2 * value.length;
    } else if (typeof value == "object") {
      memoryUsage += 8 * Object.keys(value).length;
    }
  }
  return memoryUsage;
}
