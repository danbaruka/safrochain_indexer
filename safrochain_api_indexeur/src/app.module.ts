import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AddressModule } from "./modules/address/address.module";
import { TransactionModule } from "./modules/transaction/transaction.module";
import { ValidatorModule } from "./modules/validator/validator.module";
import { BlockModule } from "./modules/block/block.module";
import { MessageModule } from "./modules/message/message.module";
import { StakingModule } from "./modules/staking/staking.module";
import { GovernanceModule } from "./modules/governance/governance.module";
import { TokenModule } from "./modules/token/token.module";
import { SupplyModule } from "./modules/supply/supply.module";
import { GenesisModule } from "./modules/genesis/genesis.module";
import databaseConfig from "./config/database.config";
import appConfig from "./config/app.config";
import swaggerConfig from "./config/swagger.config";

// Import all entities
import { Account } from "./entities/account.entity";
import { VestingAccount } from "./entities/vesting-account.entity";
import { VestingPeriod } from "./entities/vesting-period.entity";
import { Transaction } from "./entities/transaction.entity";
import { Message } from "./entities/message.entity";
import { Block } from "./entities/block.entity";
import { Validator } from "./entities/validator.entity";
import { ValidatorInfo } from "./entities/validator-info.entity";
import { ValidatorDescription } from "./entities/validator-description.entity";
import { ValidatorCommission } from "./entities/validator-commission.entity";
import { ValidatorVotingPower } from "./entities/validator-voting-power.entity";
import { ValidatorStatus } from "./entities/validator-status.entity";
import { Proposal } from "./entities/proposal.entity";
import { ProposalDeposit } from "./entities/proposal-deposit.entity";
import { ProposalVote } from "./entities/proposal-vote.entity";
import { ProposalTallyResult } from "./entities/proposal-tally-result.entity";
import { MessageType } from "./entities/message-type.entity";
import { Supply } from "./entities/supply.entity";
import { StakingPool } from "./entities/staking-pool.entity";
import { StakingParams } from "./entities/staking-params.entity";
import { ValidatorSigningInfo } from "./entities/validator-signing-info.entity";
import { CommunityPool } from "./entities/community-pool.entity";
import { DistributionParams } from "./entities/distribution-params.entity";
import { SlashingParams } from "./entities/slashing-params.entity";
import { MintParams } from "./entities/mint-params.entity";
import { Inflation } from "./entities/inflation.entity";
import { GovParams } from "./entities/gov-params.entity";
import { Token } from "./entities/token.entity";
import { TokenUnit } from "./entities/token-unit.entity";
import { TokenPrice } from "./entities/token-price.entity";
import { TokenPriceHistory } from "./entities/token-price-history.entity";
import { Genesis } from "./entities/genesis.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, swaggerConfig],
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("database.host"),
        port: configService.get("database.port"),
        username: configService.get("database.username"),
        password: configService.get("database.password"),
        database: configService.get("database.database"),
        entities: [
          Account,
          VestingAccount,
          VestingPeriod,
          Transaction,
          Message,
          Block,
          Validator,
          ValidatorInfo,
          ValidatorDescription,
          ValidatorCommission,
          ValidatorVotingPower,
          ValidatorStatus,
          Proposal,
          ProposalDeposit,
          ProposalVote,
          ProposalTallyResult,
          MessageType,
          Supply,
          StakingPool,
          StakingParams,
          ValidatorSigningInfo,
          CommunityPool,
          DistributionParams,
          SlashingParams,
          MintParams,
          Inflation,
          GovParams,
          Token,
          TokenUnit,
          TokenPrice,
          TokenPriceHistory,
          Genesis,
        ],
        synchronize: false, // Never set to true in production
        logging: configService.get("app.environment") === "development",
        ssl: false,
        extra: {
          max: 20, // Maximum number of connections in the pool
          min: 5, // Minimum number of connections in the pool
          acquire: 30000, // Maximum time to wait for a connection
          idle: 10000, // Maximum time a connection can be idle
        },
      }),
      inject: [ConfigService],
    }),
    AddressModule,
    TransactionModule,
    ValidatorModule,
    BlockModule,
    MessageModule,
    StakingModule,
    GovernanceModule,
    TokenModule,
    SupplyModule,
    GenesisModule,
  ],
})
export class AppModule {}
