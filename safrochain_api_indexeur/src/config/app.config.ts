import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  name: process.env.APP_NAME || "SafroChain API",
  version: process.env.APP_VERSION || "1.0.0",
  description:
    process.env.APP_DESCRIPTION ||
    "Professional blockchain indexer API for SafroChain",
  apiPrefix: process.env.API_PREFIX || "api/v1",
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20,
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100,
  environment: process.env.NODE_ENV || "development",
  corsOrigins: process.env.CORS_ORIGINS || "",
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
  rateLimitLimit: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 120,
  cacheTtl: parseInt(process.env.CACHE_TTL, 10) || 60,
  redisUrl: process.env.REDIS_URL || "",
  redisHost: process.env.REDIS_HOST || "",
  redisPort: parseInt(process.env.REDIS_PORT, 10) || 6379,
  redisPassword: process.env.REDIS_PASSWORD || undefined,
}));
