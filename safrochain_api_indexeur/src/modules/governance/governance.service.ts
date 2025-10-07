import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Proposal } from "../../entities/proposal.entity";
import { ProposalDeposit } from "../../entities/proposal-deposit.entity";
import { ProposalVote } from "../../entities/proposal-vote.entity";
import { ProposalTallyResult } from "../../entities/proposal-tally-result.entity";
import {
  ProposalListDto,
  ProposalResponseDto,
  ProposalVoteListDto,
  ProposalVoteResponseDto,
  ProposalDepositListDto,
  ProposalDepositResponseDto,
  GovernanceStatisticsDto,
  ProposalStatus,
  VoteOption,
  GovernanceSortBy,
  GovernanceSortOrder,
} from "../../dto/governance.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { DateFilterService } from "../../common/services/date-filter.service";
import { serializeDates } from "../../common/utils/date-serializer.util";

@Injectable()
export class GovernanceService {
  constructor(
    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,
    @InjectRepository(ProposalDeposit)
    private proposalDepositRepository: Repository<ProposalDeposit>,
    @InjectRepository(ProposalVote)
    private proposalVoteRepository: Repository<ProposalVote>,
    @InjectRepository(ProposalTallyResult)
    private proposalTallyResultRepository: Repository<ProposalTallyResult>,
    private dateFilterService: DateFilterService
  ) {}

  async getProposals(
    filters: ProposalListDto
  ): Promise<PaginatedResponseDto<ProposalResponseDto>> {
    const queryBuilder = this.proposalRepository
      .createQueryBuilder("proposal")
      .leftJoinAndSelect("proposal.proposer", "proposer")
      .leftJoinAndSelect("proposal.tally_result", "tally_result")
      .leftJoinAndSelect("proposal.deposits", "deposits")
      .leftJoinAndSelect("proposal.votes", "votes");

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere("proposal.status = :status", {
        status: filters.status,
      });
    }

    if (filters.proposer) {
      queryBuilder.andWhere("proposal.proposer_address = :proposer", {
        proposer: filters.proposer,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(proposal.title ILIKE :search OR proposal.description ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters.ids && filters.ids.length > 0) {
      queryBuilder.andWhere("proposal.id IN (:...ids)", { ids: filters.ids });
    }

    // Apply date filters
    this.dateFilterService.applyDateFilters(
      queryBuilder,
      filters,
      "proposal.submit_time"
    );

    // Apply sorting
    const sortField = filters.sort_by || GovernanceSortBy.SUBMIT_TIME;
    const sortOrder = filters.sort_order || GovernanceSortOrder.DESC;
    queryBuilder.orderBy(`proposal.${sortField}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const proposals = await queryBuilder.getMany();

    // Process responses
    const processedProposals = await Promise.all(
      proposals.map((proposal) => this.processProposalResponse(proposal))
    );

    return new PaginatedResponseDto(processedProposals, page, limit, total);
  }

  async getProposalById(id: number): Promise<ProposalResponseDto | null> {
    const proposal = await this.proposalRepository
      .createQueryBuilder("proposal")
      .leftJoinAndSelect("proposal.proposer", "proposer")
      .leftJoinAndSelect("proposal.tally_result", "tally_result")
      .leftJoinAndSelect("proposal.deposits", "deposits")
      .leftJoinAndSelect("proposal.votes", "votes")
      .where("proposal.id = :id", { id })
      .getOne();

    if (!proposal) {
      return null;
    }

    return this.processProposalResponse(proposal);
  }

  async getProposalVotes(
    filters: ProposalVoteListDto
  ): Promise<PaginatedResponseDto<ProposalVoteResponseDto>> {
    const queryBuilder = this.proposalVoteRepository
      .createQueryBuilder("vote")
      .leftJoinAndSelect("vote.proposal", "proposal")
      .leftJoinAndSelect("vote.voter", "voter");

    // Apply filters
    if (filters.proposal_id) {
      queryBuilder.andWhere("vote.proposal_id = :proposalId", {
        proposalId: filters.proposal_id,
      });
    }

    if (filters.voter) {
      queryBuilder.andWhere("vote.voter_address = :voter", {
        voter: filters.voter,
      });
    }

    if (filters.voters && filters.voters.length > 0) {
      queryBuilder.andWhere("vote.voter_address IN (:...voters)", {
        voters: filters.voters,
      });
    }

    if (filters.option) {
      queryBuilder.andWhere("vote.option = :option", {
        option: filters.option,
      });
    }

    // Apply date filters
    this.dateFilterService.applyDateFilters(
      queryBuilder,
      filters,
      "vote.submit_time"
    );

    // Apply sorting
    queryBuilder.orderBy("vote.submit_time", "DESC");

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const votes = await queryBuilder.getMany();

    // Process responses
    const processedVotes = votes.map((vote) => this.processVoteResponse(vote));

    return new PaginatedResponseDto(processedVotes, page, limit, total);
  }

  async getProposalDeposits(
    filters: ProposalDepositListDto
  ): Promise<PaginatedResponseDto<ProposalDepositResponseDto>> {
    const queryBuilder = this.proposalDepositRepository
      .createQueryBuilder("deposit")
      .leftJoinAndSelect("deposit.proposal", "proposal")
      .leftJoinAndSelect("deposit.depositor", "depositor");

    // Apply filters
    if (filters.proposal_id) {
      queryBuilder.andWhere("deposit.proposal_id = :proposalId", {
        proposalId: filters.proposal_id,
      });
    }

    if (filters.depositor) {
      queryBuilder.andWhere("deposit.depositor_address = :depositor", {
        depositor: filters.depositor,
      });
    }

    if (filters.depositors && filters.depositors.length > 0) {
      queryBuilder.andWhere("deposit.depositor_address IN (:...depositors)", {
        depositors: filters.depositors,
      });
    }

    if (filters.denom) {
      queryBuilder.andWhere("deposit.amount::text ILIKE :denom", {
        denom: `%${filters.denom}%`,
      });
    }

    // Apply date filters
    this.dateFilterService.applyDateFilters(
      queryBuilder,
      filters,
      "deposit.submit_time"
    );

    // Apply sorting
    queryBuilder.orderBy("deposit.submit_time", "DESC");

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const deposits = await queryBuilder.getMany();

    // Process responses
    const processedDeposits = deposits.map((deposit) =>
      this.processDepositResponse(deposit)
    );

    return new PaginatedResponseDto(processedDeposits, page, limit, total);
  }

  async getGovernanceStatistics(): Promise<GovernanceStatisticsDto> {
    // Get total proposals
    const totalProposals = await this.proposalRepository.count();

    // Get proposals by status
    const proposalsByStatus = await this.proposalRepository
      .createQueryBuilder("proposal")
      .select("proposal.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("proposal.status")
      .getRawMany();

    const proposalsByStatusMap = proposalsByStatus.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    // Get total votes
    const totalVotes = await this.proposalVoteRepository.count();

    // Get votes by option
    const votesByOption = await this.proposalVoteRepository
      .createQueryBuilder("vote")
      .select("vote.option", "option")
      .addSelect("COUNT(*)", "count")
      .groupBy("vote.option")
      .getRawMany();

    const votesByOptionMap = votesByOption.reduce((acc, item) => {
      acc[item.option] = parseInt(item.count);
      return acc;
    }, {});

    // Get total depositors
    const totalDepositors = await this.proposalDepositRepository
      .createQueryBuilder("deposit")
      .select("COUNT(DISTINCT deposit.depositor_address)", "count")
      .getRawOne();

    // Get most active proposers
    const mostActiveProposers = await this.proposalRepository
      .createQueryBuilder("proposal")
      .select("proposal.proposer_address", "address")
      .addSelect("COUNT(*)", "proposal_count")
      .groupBy("proposal.proposer_address")
      .orderBy("proposal_count", "DESC")
      .limit(10)
      .getRawMany();

    // Get most active voters
    const mostActiveVoters = await this.proposalVoteRepository
      .createQueryBuilder("vote")
      .select("vote.voter_address", "address")
      .addSelect("COUNT(*)", "vote_count")
      .groupBy("vote.voter_address")
      .orderBy("vote_count", "DESC")
      .limit(10)
      .getRawMany();

    // Calculate average participation rate
    const proposalsWithVotes = await this.proposalRepository
      .createQueryBuilder("proposal")
      .leftJoin("proposal.votes", "votes")
      .select("proposal.id", "id")
      .addSelect("COUNT(votes.voter_address)", "vote_count")
      .groupBy("proposal.id")
      .getRawMany();

    const averageParticipationRate =
      proposalsWithVotes.length > 0
        ? proposalsWithVotes.reduce(
            (sum, item) => sum + parseInt(item.vote_count || 0),
            0
          ) /
          proposalsWithVotes.length /
          1000 // Assuming 1000 average voters per proposal
        : 0;

    const response = {
      total_proposals: totalProposals,
      proposals_by_status: proposalsByStatusMap,
      total_votes: totalVotes,
      votes_by_option: votesByOptionMap,
      total_depositors: parseInt(totalDepositors.count),
      total_deposit_amount: [], // TODO: Calculate total deposit amount
      average_participation_rate: Math.min(averageParticipationRate, 1),
      most_active_proposers: mostActiveProposers,
      most_active_voters: mostActiveVoters,
    };

    return serializeDates(response);
  }

  private async processProposalResponse(
    proposal: Proposal
  ): Promise<ProposalResponseDto> {
    // Get statistics
    const voteCount = await this.proposalVoteRepository.count({
      where: { proposal_id: proposal.id },
    });

    const depositorCount = await this.proposalDepositRepository
      .createQueryBuilder("deposit")
      .select("COUNT(DISTINCT deposit.depositor_address)", "count")
      .where("deposit.proposal_id = :proposalId", { proposalId: proposal.id })
      .getRawOne();

    const statistics = {
      total_votes: voteCount,
      total_depositors: parseInt(depositorCount.count),
      participation_rate: voteCount > 0 ? voteCount / 1000 : 0, // Assuming 1000 average voters
    };

    const response = {
      id: proposal.id,
      title: proposal.title,
      description: proposal.description,
      metadata: proposal.metadata,
      content: proposal.content,
      submit_time: proposal.submit_time,
      deposit_end_time: proposal.deposit_end_time,
      voting_start_time: proposal.voting_start_time,
      voting_end_time: proposal.voting_end_time,
      proposer_address: proposal.proposer_address,
      status: proposal.status,
      final_tally_result: proposal.tallyResults?.[0]
        ? {
            yes: proposal.tallyResults[0].yes,
            abstain: proposal.tallyResults[0].abstain,
            no: proposal.tallyResults[0].no,
            no_with_veto: proposal.tallyResults[0].no_with_veto,
          }
        : undefined,
      total_deposit: proposal.deposits?.reduce((acc, deposit) => {
        // Aggregate deposit amounts
        return acc;
      }, []),
      voting_start_height: 0, // Not available in entity
      voting_end_height: 0, // Not available in entity
      deposit_end_height: 0, // Not available in entity
      height: 0, // Not available in entity
      statistics,
    };

    return serializeDates(response);
  }

  private processVoteResponse(vote: ProposalVote): ProposalVoteResponseDto {
    const response = {
      proposal_id: vote.proposal_id,
      voter_address: vote.voter_address,
      option: vote.option,
      metadata: "", // Not available in entity
      submit_time: vote.timestamp || new Date(),
      height: vote.height,
    };

    return serializeDates(response);
  }

  private processDepositResponse(
    deposit: ProposalDeposit
  ): ProposalDepositResponseDto {
    const response = {
      proposal_id: deposit.proposal_id,
      depositor_address: deposit.depositor_address,
      amount: deposit.amount,
      submit_time: deposit.timestamp || new Date(),
      height: deposit.height,
    };

    return serializeDates(response);
  }
}
