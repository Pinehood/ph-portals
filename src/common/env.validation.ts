import * as Joi from "joi";

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().required().default("development"),
  THROTTLER_TTL: Joi.number().required().default(60),
  THROTTLER_REQ_PER_TTL: Joi.number().required().default(600),
  GOOGLE_ANALYTICS_TAG: Joi.string().required(),
});
