import { authPaths, authSchemas } from "./auth";
import { legendPaths, legendSchemas } from "./legend";
import { info, securitySchemes, servers, sharedSchemas, tags } from "./shared";

export const openApiDocument = {
  openapi: "3.0.3",
  info,
  servers,
  tags,
  paths: {
    ...authPaths,
    ...legendPaths,
  },
  components: {
    securitySchemes,
    schemas: {
      ...authSchemas,
      ...legendSchemas,
      ...sharedSchemas,
    },
  },
} as const;
