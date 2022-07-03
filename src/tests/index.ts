import { LoggerModule } from "nestjs-pino";

export const getAllEnvironmentVariablesForJest = (): any => {
  return {
    IS_JEST_ENV: "true",
  };
};

export const getAllImportsForJest = (): any[] => {
  return [LoggerModule.forRoot()];
};

export const getAllProvidersForJest = (): any[] => {
  return [];
};
