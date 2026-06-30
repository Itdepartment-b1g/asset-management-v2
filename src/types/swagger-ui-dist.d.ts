declare module "swagger-ui-dist/swagger-ui-es-bundle" {
  type SwaggerUIBundleConfig = {
    domNode?: HTMLElement;
    url?: string;
    spec?: object;
  };

  function SwaggerUIBundle(config: SwaggerUIBundleConfig): void;

  export default SwaggerUIBundle;
}
