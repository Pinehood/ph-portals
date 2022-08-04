import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  ControllerTags,
  Portals,
  QueryParams,
  UrlParams,
} from "@resources/common/constants";
import { ApiRoutes } from "@resources/common/routes";
import { Article, Portal } from "@resources/dtos";
import { ApiService } from "@portals/services";

@ApiTags(ControllerTags.API)
@Controller(ApiRoutes.BASE)
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get(ApiRoutes.PORTALS)
  @ApiOperation({ summary: "Fetch a list of supported news portals" })
  @ApiResponse({
    status: 200,
    description: "List of portals",
    type: Portal,
    isArray: true,
  })
  getPortals(): any[] {
    return this.apiService.getPortals();
  }

  @Get(ApiRoutes.ARTICLES)
  @ApiOperation({
    summary: "Fetch a list of articles for a selected news portal",
  })
  @ApiResponse({
    status: 200,
    description: "List of articles",
    type: Article,
    isArray: true,
  })
  getArticles(
    @Param(UrlParams.PORTAL) portal: Portals,
    @Query(QueryParams.WITH_CONTENT) withContent: boolean
  ): Promise<any[]> {
    return this.apiService.getArticles(portal, withContent);
  }
}
