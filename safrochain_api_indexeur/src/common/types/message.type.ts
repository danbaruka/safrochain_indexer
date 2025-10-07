export interface MessageValue {
  "@type"?: string;
  [key: string]: any;
}

export interface ParsedMessage {
  type: string;
  module: string;
  label: string;
  value: MessageValue;
  involved_addresses: string[];
  amount?: ParsedAmount[];
  description?: string;
  category?: MessageCategory;
}

export interface ParsedAmount {
  denom: string;
  amount: string;
}

export interface MessageTypeInfo {
  type: string;
  module: string;
  label: string;
  description: string;
  category: MessageCategory;
  fields: MessageField[];
}

export enum MessageCategory {
  BANK = "bank",
  STAKING = "staking",
  GOVERNANCE = "governance",
  DISTRIBUTION = "distribution",
  SLASHING = "slashing",
  MINT = "mint",
  AUTH = "auth",
  FEES = "fees",
  UPGRADE = "upgrade",
  EVIDENCE = "evidence",
  OTHER = "other",
}

export interface MessageField {
  name: string;
  type: string;
  description: string;
  required: boolean;
  example?: any;
}

export interface MessageStatistics {
  total_messages: number;
  unique_types: number;
  most_common_type: string;
  most_common_type_count: number;
  modules: { [module: string]: number };
  categories: { [category: string]: number };
  daily_volume: { [date: string]: number };
  top_addresses: { address: string; count: number }[];
}

export interface MessageFilter {
  types?: string[];
  modules?: string[];
  categories?: MessageCategory[];
  addresses?: string[];
  date_from?: Date;
  date_to?: Date;
  height_from?: number;
  height_to?: number;
  amount_min?: string;
  amount_max?: string;
  denom?: string;
}
