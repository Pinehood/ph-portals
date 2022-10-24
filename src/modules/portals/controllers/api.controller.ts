import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  ControllerTags,
  Portals,
  QueryParams,
  UrlParams,
} from "@common/constants";
import { ApiRoutes } from "@common/routes";
import { ArticleInfo, Portal, ScraperStats } from "@resources/dtos";
import { ApiService } from "@portals/services";

@ApiTags(ControllerTags.API)
@Controller()
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
  @ApiParam({
    name: UrlParams.PORTAL,
    enum: Portals,
    required: true,
  })
  @ApiQuery({
    name: QueryParams.WITH_CONTENT,
    type: Boolean,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "List of articles",
    type: ArticleInfo,
    isArray: true,
  })
  getArticles(
    @Param(UrlParams.PORTAL) portal: Portals,
    @Query(QueryParams.WITH_CONTENT) withContent: string
  ): Promise<any[]> {
    return this.apiService.getArticles(portal, withContent);
  }

  @Get(ApiRoutes.STATS)
  @ApiOperation({
    summary: "Fetch combined scraping statistics",
  })
  @ApiResponse({
    status: 200,
    description: "Total combined statistics",
    type: ScraperStats,
  })
  getTotalStats(): Promise<any> {
    return this.apiService.getTotalStats();
  }

  @Get(ApiRoutes.PORTAL_STATS)
  @ApiOperation({
    summary: "Fetch portal's scraping statistics",
  })
  @ApiParam({
    name: UrlParams.PORTAL,
    enum: Portals,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Total scraper statistics",
    type: ScraperStats,
  })
  getPortalStats(@Param(UrlParams.PORTAL) portal: Portals): Promise<any> {
    return this.apiService.getStats(portal);
  }
}
