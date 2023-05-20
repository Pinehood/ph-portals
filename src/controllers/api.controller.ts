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
    @Query(Params.WITH_CONTENT) withContent: string
  ): ArticleInfo[] {
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
  getTotalStats(): ScraperStats {
    return this.apiService.getTotalStats();
  }

  @Get(ApiRoutes.PORTAL_STATS)
  @ApiOperation({
    summary: "Fetch portal's scraping statistics",
  })
  @ApiParam({
    name: Params.PORTAL,
    enum: Portals,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Total scraper statistics",
    type: ScraperStats,
  })
  getPortalStats(@Param(Params.PORTAL) portal: Portals): ScraperStats {
    return this.apiService.getStats(portal);
  }
}
