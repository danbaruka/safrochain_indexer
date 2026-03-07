import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export default registerAs(
  "database",
  (): TypeOrmModuleOptions => ({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || "safrochain_indexuser",
    password: process.env.DB_PASSWORD || "rootroot",
    database: process.env.DB_NAME || "safrochain_indexdb",
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],
    synchronize: false, // Never set to true in production
    logging: process.env.NODE_ENV === "development",
    ssl: false,
    extra: {
      max: parseInt(process.env.DB_POOL_MAX || "40", 10),
      min: parseInt(process.env.DB_POOL_MIN || "5", 10),
      acquire: 30000,
      idle: 10000,
    },
  })
);
