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
      max: 20, // Maximum number of connections in the pool
      min: 5, // Minimum number of connections in the pool
      acquire: 30000, // Maximum time to wait for a connection
      idle: 10000, // Maximum time a connection can be idle
    },
  })
);
