import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ApiRoutes, ControllerTags, Params, Portals } from "@/common";
import { ArticleInfo, Portal, ScraperStats } from "@/dtos";
import { ApiService } from "@/services";
import { StatsEndpoint } from "@/common/decorators";

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
  getPortals(): Portal[] {
    return this.apiService.getPortals();
  }

  @Get(ApiRoutes.ARTICLES)
  @ApiOperation({
    summary: "Fetch a list of articles for a selected news portal",
  })
  @ApiParam({
    name: Params.PORTAL,
    enum: Portals,
    required: true,
  })
  @ApiQuery({
    name: Params.WITH_CONTENT,
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
    @Param(Params.PORTAL) portal: Portals,
    @Query(Params.WITH_CONTENT) withContent: string,
  ): ArticleInfo[] {
    return this.apiService.getArticles(portal, withContent);
  }

  @StatsEndpoint(
    ApiRoutes.STATS,
    "Fetch combined scraping statistics",
    "Total combined statistics",
  )
  getTotalStats(): ScraperStats {
    return this.apiService.getTotalStats();
  }

  @StatsEndpoint(
    ApiRoutes.PORTAL_STATS,
    "Fetch portal's scraping statistics",
    "Total scraper statistics",
    true,
  )
  getPortalStats(@Param(Params.PORTAL) portal: Portals): ScraperStats {
    return this.apiService.getStats(portal);
  }
}
