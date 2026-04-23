import { applyDecorators, Get } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
} from "@nestjs/swagger";
import { CommonConstants, Params, Portals } from "@/common/enums";
import { ScraperStats } from "@/dtos";

const PORTALS_VALUES = Object.values(Portals);

export function HtmlEndpoint(
  route: string,
  summary: string,
  description: string,
  portal?: boolean,
) {
  if (portal == true) {
    return applyDecorators(
      Get(route),
      ApiProduces(CommonConstants.TEXT_HTML),
      ApiOperation({ summary }),
      ApiParam({
        name: Params.PORTAL,
        enum: PORTALS_VALUES,
        type: String,
        required: true,
      }),
      ApiResponse({
        status: 200,
        description,
      }),
    );
  } else {
    return applyDecorators(
      Get(route),
      ApiProduces(CommonConstants.TEXT_HTML),
      ApiOperation({ summary }),
      ApiResponse({
        status: 200,
        description,
      }),
    );
  }
}

export function StatsEndpoint(
  route: string,
  summary: string,
  description: string,
  portal?: boolean,
) {
  if (portal == true) {
    return applyDecorators(
      Get(route),
      ApiOperation({ summary }),
      ApiParam({
        name: Params.PORTAL,
        enum: PORTALS_VALUES,
        type: String,
        required: true,
      }),
      ApiResponse({
        status: 200,
        description,
        type: ScraperStats,
      }),
    );
  } else {
    return applyDecorators(
      Get(route),
      ApiOperation({ summary }),
      ApiResponse({
        status: 200,
        description,
        type: ScraperStats,
      }),
    );
  }
}
