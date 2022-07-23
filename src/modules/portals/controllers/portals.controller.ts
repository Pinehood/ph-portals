import { Controller, Get, Param } from "@nestjs/common";
import { ApiProduces, ApiTags } from "@nestjs/swagger";
import {
  CommonConstants,
  ControllerTags,
  Portals,
  PortalsRoutes,
  UrlParams,
} from "@modules/common";
import { TemplateContentService } from "@portals/services";

@ApiTags(ControllerTags.PORTALS)
@Controller(PortalsRoutes.BASE)
export class PortalsController {
  constructor(
    private readonly templateContentService: TemplateContentService
  ) {}

  @Get(PortalsRoutes.PORTAL)
  @ApiProduces(CommonConstants.TEXT_HTML)
  async getPage(@Param(UrlParams.PORTAL) portal: Portals): Promise<string> {
    return this.templateContentService.getPage(portal);
  }
}
