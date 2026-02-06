import { registerAs } from "@nestjs/config";

export default registerAs("swagger", () => ({
  title: process.env.SWAGGER_TITLE || "SafroChain API",
  description:
    process.env.SWAGGER_DESCRIPTION ||
    "Professional blockchain indexer API for SafroChain",
  version: process.env.SWAGGER_VERSION || "1.0.0",
  path: process.env.SWAGGER_PATH || "docs",
  enabled:
    process.env.SWAGGER_ENABLED !== undefined
      ? process.env.SWAGGER_ENABLED === "true"
      : process.env.NODE_ENV !== "production",
}));
