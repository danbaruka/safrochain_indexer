import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require("compression");

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Configure JSON serialization for dates
    logger: ["error", "warn", "log"],
  });
  const configService = app.get(ConfigService);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
        },
      },
    })
  );
  app.use(
    compression({
      filter: (req, res) => !req.path?.startsWith("/docs"),
    })
  );

  // Configure JSON serialization to ensure dates are properly formatted
  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      // Ensure all Date objects are serialized as ISO strings
      const serializedData = JSON.parse(
        JSON.stringify(data, (key, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        })
      );
      return originalJson.call(this, serializedData);
    };
    next();
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const corsOriginsRaw = (configService.get<string>("app.corsOrigins") || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const corsWildcardPatterns = corsOriginsRaw.filter((o) =>
    o.startsWith("*.")
  ) as string[];
  const corsExactOrigins = corsOriginsRaw.filter((o) => !o.startsWith("*."));

  let corsOrigin: boolean | string[] | ((origin: string, cb: (err: Error | null, allow?: boolean) => void) => void);
  if (corsOriginsRaw.length === 0) {
    corsOrigin = configService.get("app.environment") === "development";
  } else if (corsWildcardPatterns.length > 0) {
    corsOrigin = (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, false);
      if (corsExactOrigins.includes(origin)) return callback(null, true);
      try {
        const hostname = new URL(origin).hostname;
        const match = corsWildcardPatterns.some((pattern) => {
          const domain = pattern.slice(2);
          return hostname === domain || hostname.endsWith(`.${domain}`);
        });
        callback(null, match);
      } catch {
        callback(null, false);
      }
    };
  } else {
    corsOrigin = corsExactOrigins;
  }

  const corsCredentials = corsOriginsRaw.length > 0;

  // CORS configuration
  app.enableCors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Credentials",
      "X-HTTP-Method-Override",
      "Cache-Control",
      "Pragma",
    ],
    credentials: corsCredentials,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  });

  // Global prefix
  const apiPrefix = configService.get("app.apiPrefix");
  app.setGlobalPrefix(apiPrefix);

  if (configService.get("swagger.enabled")) {
    const swaggerTitle = configService.get("swagger.title");
    const swaggerDescription = configService.get("swagger.description");
    const swaggerVersion = configService.get("swagger.version");
    const swaggerPath = configService.get("swagger.path");

    const config = new DocumentBuilder()
      .setTitle(swaggerTitle)
      .setDescription(
        `${swaggerDescription}\n\n` +
          "## Pagination\n" +
          "- **page** / **limit** / **offset**: Standard pagination. Limit is clamped to max 100.\n" +
          "- **cursor**: For O(1) deep pagination, pass block height. Use `next_cursor` from response for next page.\n" +
          "- All list endpoints enforce pagination; omit params for defaults (page=1, limit=20)."
      )
      .setVersion(swaggerVersion)
      .addTag("Address", "Address-related operations")
      .addTag("Transaction", "Transaction-related operations")
      .addTag("Validator", "Validator-related operations")
      .addTag("Block", "Block-related operations")
      .addTag("Message", "Message-related operations")
      .addTag("Staking", "Staking-related operations")
      .addTag("Governance", "Governance-related operations")
      .addTag("Token", "Token-related operations")
      .addTag("Supply", "Supply-related operations")
      .addTag("Genesis", "Genesis-related operations")
      .addServer(
        `http://localhost:${configService.get("app.port")}`,
        "Development server"
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "none",
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: `${swaggerTitle} Documentation`,
      customfavIcon: "/favicon.ico",
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #3b82f6; }
        .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 4px; }
      `,
      customCssUrl: "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css",
      customJs: [
        "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js",
        "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js",
      ],
    });
  }

  // Start server
  const port = configService.get("app.port");
  await app.listen(port);

  console.log(
    `🚀 SafroChain API is running on: http://localhost:${port}/${apiPrefix}`
  );
  const swaggerEnabled = configService.get("swagger.enabled");
  if (swaggerEnabled) {
    console.log(
      `📚 Swagger documentation: http://localhost:${port}/${configService.get("swagger.path")}`
    );
  }
  console.log(`🌍 Environment: ${configService.get("app.environment")}`);
}

bootstrap().catch((error) => {
  console.error("❌ Error starting SafroChain API:", error);
  process.exit(1);
});
