import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenController } from "./token.controller";
import { TokenService } from "./token.service";
import { Token } from "../../entities/token.entity";
import { TokenUnit } from "../../entities/token-unit.entity";
import { TokenPrice } from "../../entities/token-price.entity";
import { TokenPriceHistory } from "../../entities/token-price-history.entity";
import { DateFilterService } from "../../common/services/date-filter.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, TokenUnit, TokenPrice, TokenPriceHistory]),
  ],
  controllers: [TokenController],
  providers: [TokenService, DateFilterService],
  exports: [TokenService],
})
export class TokenModule {}
