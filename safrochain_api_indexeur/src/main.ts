import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Configure JSON serialization for dates
    logger: ["error", "warn", "log"],
  });
  const configService = app.get(ConfigService);

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

  // Additional CORS middleware for better compatibility
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
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

  // CORS configuration - Allow all origins for development
  app.enableCors({
    origin: true, // Allow all origins in development
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
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  });

  // Global prefix
  const apiPrefix = configService.get("app.apiPrefix");
  app.setGlobalPrefix(apiPrefix);

  // Swagger configuration
  const swaggerTitle = configService.get("swagger.title");
  const swaggerDescription = configService.get("swagger.description");
  const swaggerVersion = configService.get("swagger.version");
  const swaggerPath = configService.get("swagger.path");

  const config = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
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
  });

  // Start server
  const port = configService.get("app.port");
  await app.listen(port);

  console.log(
    `🚀 SafroChain API is running on: http://localhost:${port}/${apiPrefix}`
  );
  console.log(
    `📚 Swagger documentation: http://localhost:${port}/${swaggerPath}`
  );
  console.log(`🌍 Environment: ${configService.get("app.environment")}`);
}

bootstrap().catch((error) => {
  console.error("❌ Error starting SafroChain API:", error);
  process.exit(1);
});
