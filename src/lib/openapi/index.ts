import { authPaths, authSchemas } from "./auth";
import { legendPaths, legendSchemas } from "./legend";
import { locationPaths, locationSchemas } from "./location";
import { departmentPaths, departmentSchemas } from "./department";
import { conditionPaths, conditionSchemas } from "./condition";
import { assetPaths, assetSchemas } from "./asset";
import { info, securitySchemes, servers, sharedSchemas, tags } from "./shared";


export const openApiDocument = {
  openapi: "3.0.3",
  info,
  servers,
  tags,
  paths: {
    ...authPaths,
    ...legendPaths,
    ...locationPaths,
    ...departmentPaths,
    ...conditionPaths,
    ...assetPaths,
  },
  components: {
    securitySchemes,
    schemas: {
      ...authSchemas,
      ...legendSchemas,
      ...locationSchemas,
      ...departmentSchemas,
      ...conditionSchemas,
      ...assetSchemas,
      ...sharedSchemas,
    },
  },
} as const;
