import { Injectable } from "@nestjs/common";
import {
  MessageTypeInfo,
  MessageCategory,
  ParsedMessage,
  ParsedAmount,
  MessageValue,
} from "../types/message.type";

@Injectable()
export class MessageParserService {
  private readonly messageTypes: Map<string, MessageTypeInfo> = new Map();

  constructor() {
    this.initializeMessageTypes();
  }

  private initializeMessageTypes() {
    // Bank module messages
    this.addMessageType({
      type: "/cosmos.bank.v1beta1.MsgSend",
      module: "bank",
      label: "Send",
      description: "Send coins from one account to another",
      category: MessageCategory.BANK,
      fields: [
        {
          name: "from_address",
          type: "string",
          description: "Sender address",
          required: true,
        },
        {
          name: "to_address",
          type: "string",
          description: "Recipient address",
          required: true,
        },
        {
          name: "amount",
          type: "array",
          description: "Amount to send",
          required: true,
        },
      ],
    });

    this.addMessageType({
      type: "/cosmos.bank.v1beta1.MsgMultiSend",
      module: "bank",
      label: "Multi Send",
      description: "Send coins to multiple recipients",
      category: MessageCategory.BANK,
      fields: [
        {
          name: "inputs",
          type: "array",
          description: "Input addresses and amounts",
          required: true,
        },
        {
          name: "outputs",
          type: "array",
          description: "Output addresses and amounts",
          required: true,
        },
      ],
    });

    // Staking module messages
    this.addMessageType({
      type: "/cosmos.staking.v1beta1.MsgDelegate",
      module: "staking",
      label: "Delegate",
      description: "Delegate tokens to a validator",
      category: MessageCategory.STAKING,
      fields: [
        {
          name: "delegator_address",
          type: "string",
          description: "Delegator address",
          required: true,
        },
        {
          name: "validator_address",
          type: "string",
          description: "Validator address",
          required: true,
        },
        {
          name: "amount",
          type: "object",
          description: "Amount to delegate",
          required: true,
        },
      ],
    });

    this.addMessageType({
      type: "/cosmos.staking.v1beta1.MsgUndelegate",
      module: "staking",
      label: "Undelegate",
      description: "Undelegate tokens from a validator",
      category: MessageCategory.STAKING,
      fields: [
        {
          name: "delegator_address",
          type: "string",
          description: "Delegator address",
          required: true,
        },
        {
          name: "validator_address",
          type: "string",
          description: "Validator address",
          required: true,
        },
        {
          name: "amount",
          type: "object",
          description: "Amount to undelegate",
          required: true,
        },
      ],
    });

    this.addMessageType({
      type: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
      module: "staking",
      label: "Redelegate",
      description: "Redelegate tokens from one validator to another",
      category: MessageCategory.STAKING,
      fields: [
        {
          name: "delegator_address",
          type: "string",
          description: "Delegator address",
          required: true,
        },
        {
          name: "validator_src_address",
          type: "string",
          description: "Source validator address",
          required: true,
        },
        {
          name: "validator_dst_address",
          type: "string",
          description: "Destination validator address",
          required: true,
        },
        {
          name: "amount",
          type: "object",
          description: "Amount to redelegate",
          required: true,
        },
      ],
    });

    // Governance module messages
    this.addMessageType({
      type: "/cosmos.gov.v1.MsgSubmitProposal",
      module: "gov",
      label: "Submit Proposal",
      description: "Submit a governance proposal",
      category: MessageCategory.GOVERNANCE,
      fields: [
        {
          name: "messages",
          type: "array",
          description: "Proposal messages",
          required: true,
        },
        {
          name: "initial_deposit",
          type: "array",
          description: "Initial deposit",
          required: true,
        },
        {
          name: "proposer",
          type: "string",
          description: "Proposer address",
          required: true,
        },
        {
          name: "metadata",
          type: "string",
          description: "Proposal metadata",
          required: true,
        },
        {
          name: "title",
          type: "string",
          description: "Proposal title",
          required: true,
        },
        {
          name: "summary",
          type: "string",
          description: "Proposal summary",
          required: true,
        },
      ],
    });

    this.addMessageType({
      type: "/cosmos.gov.v1.MsgDeposit",
      module: "gov",
      label: "Deposit",
      description: "Deposit tokens for a governance proposal",
      category: MessageCategory.GOVERNANCE,
      fields: [
        {
          name: "proposal_id",
          type: "string",
          description: "Proposal ID",
          required: true,
        },
        {
          name: "depositor",
          type: "string",
          description: "Depositor address",
          required: true,
        },
        {
          name: "amount",
          type: "array",
          description: "Deposit amount",
          required: true,
        },
      ],
    });

    this.addMessageType({
      type: "/cosmos.gov.v1.MsgVote",
      module: "gov",
      label: "Vote",
      description: "Vote on a governance proposal",
      category: MessageCategory.GOVERNANCE,
      fields: [
        {
          name: "proposal_id",
          type: "string",
          description: "Proposal ID",
          required: true,
        },
        {
          name: "voter",
          type: "string",
          description: "Voter address",
          required: true,
        },
        {
          name: "option",
          type: "string",
          description: "Vote option",
          required: true,
        },
        {
          name: "metadata",
          type: "string",
          description: "Vote metadata",
          required: false,
        },
      ],
    });

    // Distribution module messages
    this.addMessageType({
      type: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
      module: "distribution",
      label: "Withdraw Rewards",
      description: "Withdraw delegation rewards",
      category: MessageCategory.DISTRIBUTION,
      fields: [
        {
          name: "delegator_address",
          type: "string",
          description: "Delegator address",
          required: true,
        },
        {
          name: "validator_address",
          type: "string",
          description: "Validator address",
          required: true,
        },
      ],
    });

    // Slashing module messages
    this.addMessageType({
      type: "/cosmos.slashing.v1beta1.MsgUnjail",
      module: "slashing",
      label: "Unjail",
      description: "Unjail a validator",
      category: MessageCategory.SLASHING,
      fields: [
        {
          name: "validator_addr",
          type: "string",
          description: "Validator address",
          required: true,
        },
      ],
    });

    // Auth module messages
    this.addMessageType({
      type: "/cosmos.auth.v1beta1.MsgUpdateParams",
      module: "auth",
      label: "Update Auth Params",
      description: "Update authentication parameters",
      category: MessageCategory.AUTH,
      fields: [
        {
          name: "params",
          type: "object",
          description: "New parameters",
          required: true,
        },
        {
          name: "authority",
          type: "string",
          description: "Authority address",
          required: true,
        },
      ],
    });

    // Fee grant module messages
    this.addMessageType({
      type: "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
      module: "feegrant",
      label: "Grant Fee Allowance",
      description: "Grant fee allowance to another account",
      category: MessageCategory.FEES,
      fields: [
        {
          name: "granter",
          type: "string",
          description: "Granter address",
          required: true,
        },
        {
          name: "grantee",
          type: "string",
          description: "Grantee address",
          required: true,
        },
        {
          name: "allowance",
          type: "object",
          description: "Allowance details",
          required: true,
        },
      ],
    });

    this.addMessageType({
      type: "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
      module: "feegrant",
      label: "Revoke Fee Allowance",
      description: "Revoke fee allowance from another account",
      category: MessageCategory.FEES,
      fields: [
        {
          name: "granter",
          type: "string",
          description: "Granter address",
          required: true,
        },
        {
          name: "grantee",
          type: "string",
          description: "Grantee address",
          required: true,
        },
      ],
    });

    // Upgrade module messages
    this.addMessageType({
      type: "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade",
      module: "upgrade",
      label: "Software Upgrade",
      description: "Propose a software upgrade",
      category: MessageCategory.UPGRADE,
      fields: [
        {
          name: "authority",
          type: "string",
          description: "Authority address",
          required: true,
        },
        {
          name: "plan",
          type: "object",
          description: "Upgrade plan",
          required: true,
        },
      ],
    });

    this.addMessageType({
      type: "/cosmos.upgrade.v1beta1.MsgCancelUpgrade",
      module: "upgrade",
      label: "Cancel Upgrade",
      description: "Cancel a software upgrade",
      category: MessageCategory.UPGRADE,
      fields: [
        {
          name: "authority",
          type: "string",
          description: "Authority address",
          required: true,
        },
      ],
    });

    // Evidence module messages
    this.addMessageType({
      type: "/cosmos.evidence.v1beta1.MsgSubmitEvidence",
      module: "evidence",
      label: "Submit Evidence",
      description: "Submit evidence of misbehavior",
      category: MessageCategory.EVIDENCE,
      fields: [
        {
          name: "submitter",
          type: "string",
          description: "Submitter address",
          required: true,
        },
        {
          name: "evidence",
          type: "object",
          description: "Evidence details",
          required: true,
        },
      ],
    });
  }

  private addMessageType(typeInfo: MessageTypeInfo) {
    this.messageTypes.set(typeInfo.type, typeInfo);
  }

  public parseMessage(
    type: string,
    value: MessageValue,
    involvedAddresses: string[]
  ): ParsedMessage {
    const typeInfo = this.messageTypes.get(type);

    if (!typeInfo) {
      return {
        type,
        module: this.extractModuleFromType(type),
        label: this.extractLabelFromType(type),
        value,
        involved_addresses: involvedAddresses,
        description: "Unknown message type",
      };
    }

    const amount = this.extractAmount(value, type);

    return {
      type,
      module: typeInfo.module,
      label: typeInfo.label,
      value,
      involved_addresses: involvedAddresses,
      amount,
      description: typeInfo.description,
    };
  }

  public getMessageTypeInfo(type: string): MessageTypeInfo | undefined {
    return this.messageTypes.get(type);
  }

  public getAllMessageTypes(): MessageTypeInfo[] {
    return Array.from(this.messageTypes.values());
  }

  public getMessageTypesByModule(module: string): MessageTypeInfo[] {
    return Array.from(this.messageTypes.values()).filter(
      (type) => type.module === module
    );
  }

  public getMessageTypesByCategory(
    category: MessageCategory
  ): MessageTypeInfo[] {
    return Array.from(this.messageTypes.values()).filter(
      (type) => type.category === category
    );
  }

  private extractModuleFromType(type: string): string {
    const parts = type.split(".");
    if (parts.length >= 2) {
      return parts[1];
    }
    return "unknown";
  }

  private extractLabelFromType(type: string): string {
    const parts = type.split(".");
    if (parts.length >= 3) {
      return parts[2].replace("Msg", "");
    }
    return "Unknown";
  }

  private extractAmount(
    value: MessageValue,
    type: string
  ): ParsedAmount[] | undefined {
    switch (type) {
      case "/cosmos.bank.v1beta1.MsgSend":
        return value.amount || [];

      case "/cosmos.bank.v1beta1.MsgMultiSend":
        const amounts: ParsedAmount[] = [];
        if (value.inputs) {
          value.inputs.forEach((input: any) => {
            if (input.coins) {
              amounts.push(...input.coins);
            }
          });
        }
        return amounts.length > 0 ? amounts : undefined;

      case "/cosmos.staking.v1beta1.MsgDelegate":
      case "/cosmos.staking.v1beta1.MsgUndelegate":
      case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
        return value.amount ? [value.amount] : undefined;

      case "/cosmos.gov.v1.MsgSubmitProposal":
        return value.initial_deposit || [];

      case "/cosmos.gov.v1.MsgDeposit":
        return value.amount || [];

      default:
        // Try to find amount field in the value
        if (value.amount) {
          return Array.isArray(value.amount) ? value.amount : [value.amount];
        }
        return undefined;
    }
  }

  public extractInvolvedAddresses(value: MessageValue, type: string): string[] {
    const addresses: string[] = [];

    switch (type) {
      case "/cosmos.bank.v1beta1.MsgSend":
        if (value.from_address) addresses.push(value.from_address);
        if (value.to_address) addresses.push(value.to_address);
        break;

      case "/cosmos.bank.v1beta1.MsgMultiSend":
        if (value.inputs) {
          value.inputs.forEach((input: any) => {
            if (input.address) addresses.push(input.address);
          });
        }
        if (value.outputs) {
          value.outputs.forEach((output: any) => {
            if (output.address) addresses.push(output.address);
          });
        }
        break;

      case "/cosmos.staking.v1beta1.MsgDelegate":
      case "/cosmos.staking.v1beta1.MsgUndelegate":
        if (value.delegator_address) addresses.push(value.delegator_address);
        if (value.validator_address) addresses.push(value.validator_address);
        break;

      case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
        if (value.delegator_address) addresses.push(value.delegator_address);
        if (value.validator_src_address)
          addresses.push(value.validator_src_address);
        if (value.validator_dst_address)
          addresses.push(value.validator_dst_address);
        break;

      case "/cosmos.gov.v1.MsgSubmitProposal":
        if (value.proposer) addresses.push(value.proposer);
        break;

      case "/cosmos.gov.v1.MsgDeposit":
        if (value.depositor) addresses.push(value.depositor);
        break;

      case "/cosmos.gov.v1.MsgVote":
        if (value.voter) addresses.push(value.voter);
        break;

      case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
        if (value.delegator_address) addresses.push(value.delegator_address);
        if (value.validator_address) addresses.push(value.validator_address);
        break;

      case "/cosmos.slashing.v1beta1.MsgUnjail":
        if (value.validator_addr) addresses.push(value.validator_addr);
        break;

      case "/cosmos.feegrant.v1beta1.MsgGrantAllowance":
      case "/cosmos.feegrant.v1beta1.MsgRevokeAllowance":
        if (value.granter) addresses.push(value.granter);
        if (value.grantee) addresses.push(value.grantee);
        break;

      case "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade":
      case "/cosmos.upgrade.v1beta1.MsgCancelUpgrade":
        if (value.authority) addresses.push(value.authority);
        break;

      case "/cosmos.evidence.v1beta1.MsgSubmitEvidence":
        if (value.submitter) addresses.push(value.submitter);
        break;

      default:
        // Generic extraction for common field names
        const commonFields = [
          "from_address",
          "to_address",
          "delegator_address",
          "validator_address",
          "proposer",
          "depositor",
          "voter",
          "granter",
          "grantee",
          "authority",
          "submitter",
          "sender",
          "receiver",
        ];

        commonFields.forEach((field) => {
          if (value[field]) {
            addresses.push(value[field]);
          }
        });
        break;
    }

    return [...new Set(addresses)]; // Remove duplicates
  }
}
