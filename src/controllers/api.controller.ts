import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { IsString } from "class-validator";
import { ApiRoutes } from "@/common/routes";
import { ControllerTags, Params, Portals } from "@/common/enums";
import { StatsEndpoint } from "@/common/decorators";
import { ArticleInfo, Portal, ScraperStats } from "@/dtos";
import { ApiService } from "@/services";
import { Throttle } from "@nestjs/throttler";

// Extract enum values to avoid circular dependency in Swagger
const PORTALS_VALUES = Object.values(Portals);

class Prompt {
  @ApiProperty()
  @IsString()
  prompt: string;
}

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
    enum: PORTALS_VALUES,
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
    @Query(Params.WITH_CONTENT) withContent: boolean,
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

  @Post(ApiRoutes.PROMPT_AI)
  @ApiOperation({ summary: "Prompt OpenAI API" })
  @ApiResponse({
    status: 200,
    description: "Response from OpenAI API",
    type: String,
  })
  @Throttle({ default: { limit: 1, ttl: 30 * 1000 } })
  async promptOpenAI(@Body() body: Prompt) {
    return this.apiService.promptOpenAI(body.prompt);
  }
}
