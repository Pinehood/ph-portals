import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CommonConstants,
  ControllerTags,
  Portals,
  UrlParams,
} from "@resources/common/constants";
import { PortalsRoutes } from "@resources/common/routes";
import { PortalsService } from "@portals/services";

@ApiTags(ControllerTags.PORTALS)
@Controller(PortalsRoutes.BASE)
export class PortalsController {
  constructor(private readonly portalsService: PortalsService) {}

  @Get(PortalsRoutes.PORTAL)
  @ApiProduces(CommonConstants.TEXT_HTML)
  @ApiOperation({ summary: "Fetch portal's page content with article list" })
  @ApiParam({
    name: UrlParams.PORTAL,
    enum: Portals,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Portal page content",
  })
  getPage(@Param(UrlParams.PORTAL) portal: Portals): Promise<string> {
    return this.portalsService.getCachedPage(portal);
  }

  @Get(PortalsRoutes.ARTICLE)
  @ApiProduces(CommonConstants.TEXT_HTML)
  @ApiOperation({ summary: "Fetch article's page content" })
  @ApiParam({
    name: UrlParams.PORTAL,
    enum: Portals,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Article page content",
  })
  getArticle(
    @Param(UrlParams.PORTAL) portal: Portals,
    @Param(UrlParams.ARTICLE_ID) articleId: string
  ): Promise<string> {
    return this.portalsService.getCachedArticle(portal, articleId);
  }
}
