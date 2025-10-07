import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Genesis } from "../../entities/genesis.entity";
import { GenesisResponseDto } from "../../dto/genesis.dto";
import { serializeDates } from "../../common/utils/date-serializer.util";

@Injectable()
export class GenesisService {
  constructor(
    @InjectRepository(Genesis)
    private genesisRepository: Repository<Genesis>
  ) {}

  async getGenesis(): Promise<GenesisResponseDto | null> {
    const genesis = await this.genesisRepository
      .createQueryBuilder("genesis")
      .orderBy("genesis.height", "DESC")
      .limit(1)
      .getOne();

    if (!genesis) {
      return null;
    }

    return this.processGenesisResponse(genesis);
  }

  async getGenesisByHeight(height: number): Promise<GenesisResponseDto | null> {
    const genesis = await this.genesisRepository
      .createQueryBuilder("genesis")
      .where("genesis.height = :height", { height })
      .getOne();

    if (!genesis) {
      return null;
    }

    return this.processGenesisResponse(genesis);
  }

  private processGenesisResponse(genesis: Genesis): GenesisResponseDto {
    const response = {
      chain_id: genesis.chain_id,
      genesis_time: genesis.time,
      initial_height: genesis.initial_height,
      genesis_hash: "", // Not available in entity
      app_hash: "", // Not available in entity
      genesis_data: {}, // Not available in entity
      height: genesis.initial_height,
    };

    return serializeDates(response);
  }
}
