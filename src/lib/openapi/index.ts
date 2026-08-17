import { authPaths, authSchemas } from "./auth";
import { legendPaths, legendSchemas } from "./legend";
import { locationPaths, locationSchemas } from "./location";
import { departmentPaths, departmentSchemas } from "./department";
import { conditionPaths, conditionSchemas } from "./condition";
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
  },
  components: {
    securitySchemes,
    schemas: {
      ...authSchemas,
      ...legendSchemas,
      ...locationSchemas,
      ...departmentSchemas,
      ...conditionSchemas,
      ...sharedSchemas,
    },
  },
} as const;
