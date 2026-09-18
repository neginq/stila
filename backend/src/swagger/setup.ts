import type { Express } from "express"
import { serve, setup } from "swagger-ui-express"
import { openApiSpec } from "./openapi"

export function setupSwagger(app: Express): void {
    app.use(
        "/docs",
        ...serve,
        setup(openApiSpec, {
            customSiteTitle: "Stylist API Docs",
        }),
    )
}
