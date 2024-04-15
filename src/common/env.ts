import * as Joi from "joi";
import { CommonConstants } from "@/common/enums";

export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  THROTTLER_TTL: parseInt(process.env.THROTTLER_TTL ?? "60", 10),
  THROTTLER_REQ_PER_TTL: parseInt(
    process.env.THROTTLER_REQ_PER_TTL ?? "120",
    10,
  ),
  SWAGGER_USE_METADATA_FILE:
    process.env.SWAGGER_USE_METADATA_FILE === CommonConstants.TRUE_STRING,
  GOOGLE_ANALYTICS_TAG: process.env.GOOGLE_ANALYTICS_TAG,
});

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().required().default("development"),
  THROTTLER_TTL: Joi.number().required().default(60),
  THROTTLER_REQ_PER_TTL: Joi.number().required().default(600),
  SWAGGER_USE_METADATA_FILE: Joi.string().required().default(true),
  GOOGLE_ANALYTICS_TAG: Joi.string().required(),
});
