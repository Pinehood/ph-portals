import { Controller, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PortalsRoutes } from "@/common/routes";
import { ControllerTags, Params, Portals } from "@/common/enums";
import { HtmlEndpoint } from "@/common/decorators";
import { PortalsService } from "@/services";

@ApiTags(ControllerTags.PORTALS)
@Controller()
export class PortalsController {
  constructor(private readonly portalsService: PortalsService) {}

  @HtmlEndpoint(
    PortalsRoutes.ROOT,
    "Fetch portal's home page content",
    "Home page content",
  )
  getHome(): string {
    return this.portalsService.getCachedPage(Portals.HOME);
  }

  @HtmlEndpoint(
    PortalsRoutes.PORTAL,
    "Fetch portal's page content with article list",
    "Portal page content",
    true,
  )
  getPage(@Param(Params.PORTAL) portal: Portals): string {
    return this.portalsService.getCachedPage(portal);
  }

  @HtmlEndpoint(
    PortalsRoutes.ARTICLE,
    "Fetch article's page content",
    "Article page content",
    true,
  )
  getArticle(
    @Param(Params.PORTAL) portal: Portals,
    @Param(Params.ARTICLE_ID) articleId: string,
  ): string {
    return this.portalsService.getCachedArticle(portal, articleId);
  }
}
