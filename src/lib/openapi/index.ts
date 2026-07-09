import { authPaths, authSchemas } from "./auth";
import { info, securitySchemes, servers, sharedSchemas, tags } from "./shared";

export const openApiDocument = {
  openapi: "3.0.3",
  info,
  servers,
  tags,
  paths: {
    ...authPaths,
  },
  components: {
    securitySchemes,
    schemas: {
      ...authSchemas,
      ...sharedSchemas,
    },
  },
} as const;
