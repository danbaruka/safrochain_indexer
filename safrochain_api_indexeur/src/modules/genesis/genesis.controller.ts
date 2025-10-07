import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { GenesisService } from "./genesis.service";
import { GenesisResponseDto } from "../../dto/genesis.dto";

@ApiTags("Genesis")
@Controller("genesis")
export class GenesisController {
  constructor(private readonly genesisService: GenesisService) {}

  @Get()
  @ApiOperation({
    summary: "Get genesis information",
    description:
      "Retrieve the blockchain genesis information including chain ID, genesis time, and initial height.",
  })
  @ApiResponse({
    status: 200,
    description: "Genesis information retrieved successfully",
    type: GenesisResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Genesis information not found",
  })
  async getGenesis() {
    const genesis = await this.genesisService.getGenesis();
    if (!genesis) {
      throw new HttpException(
        "Genesis information not found",
        HttpStatus.NOT_FOUND
      );
    }
    return genesis;
  }

  @Get("height/:height")
  @ApiOperation({
    summary: "Get genesis information by height",
    description: "Retrieve genesis information for a specific block height.",
  })
  @ApiParam({
    name: "height",
    description: "Block height",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Genesis information retrieved successfully",
    type: GenesisResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Genesis information not found",
  })
  async getGenesisByHeight(@Param("height") height: number) {
    const genesis = await this.genesisService.getGenesisByHeight(height);
    if (!genesis) {
      throw new HttpException(
        "Genesis information not found",
        HttpStatus.NOT_FOUND
      );
    }
    return genesis;
  }
}
