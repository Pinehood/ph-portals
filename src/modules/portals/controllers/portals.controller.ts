import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ControllerTags, PortalsRoutes } from "@modules/common";

@ApiTags(ControllerTags.PORTALS)
@Controller(PortalsRoutes.BASE)
export class PortalsController {}
