import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GenesisController } from "./genesis.controller";
import { GenesisService } from "./genesis.service";
import { Genesis } from "../../entities/genesis.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Genesis])],
  controllers: [GenesisController],
  providers: [GenesisService],
  exports: [GenesisService],
})
export class GenesisModule {}
