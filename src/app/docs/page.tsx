"use client";

import { useEffect, useRef } from "react";
import "swagger-ui-dist/swagger-ui.css";

export default function ApiDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function initSwagger() {
      const { default: SwaggerUIBundle } = await import(
        "swagger-ui-dist/swagger-ui-es-bundle"
      );

      if (!mounted || !containerRef.current) return;

      SwaggerUIBundle({
        domNode: containerRef.current,
        url: "/api/openapi",
        // swagger-ui types omit requestInterceptor; needed to send session cookies
        ...({
          requestInterceptor: (request: { credentials?: RequestCredentials }) => {
            request.credentials = "include";
            return request;
          },
        } as Record<string, unknown>),
      });
    }

    void initSwagger();

    return () => {
      mounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div ref={containerRef} />
    </main>
  );
}
