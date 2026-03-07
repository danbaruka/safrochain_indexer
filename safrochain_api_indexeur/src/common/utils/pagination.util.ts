import { ConfigService } from "@nestjs/config";

export type PagePaginationInput = {
  page?: number;
  limit?: number;
};

export type OffsetPaginationInput = {
  limit?: number;
  offset?: number;
};

export type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  next_cursor?: number;
};

const getDefaultLimit = (configService: ConfigService): number =>
  configService.get<number>("app.defaultPageSize") ?? 20;

const getMaxLimit = (configService: ConfigService): number =>
  configService.get<number>("app.maxPageSize") ?? 100;

const clampLimit = (limit: number, configService: ConfigService): number => {
  const maxLimit = getMaxLimit(configService);
  if (limit > maxLimit) {
    return maxLimit;
  }
  return limit;
};

export const normalizePagePagination = (
  pagination: PagePaginationInput,
  configService: ConfigService
): PaginationParams => {
  const defaultLimit = getDefaultLimit(configService);
  const rawPage = pagination.page ?? 1;
  const rawLimit = pagination.limit ?? defaultLimit;

  const page = Math.max(1, rawPage);
  const limit = clampLimit(Math.max(1, rawLimit), configService);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const normalizeOffsetPagination = (
  pagination: OffsetPaginationInput,
  configService: ConfigService
): PaginationParams => {
  const defaultLimit = getDefaultLimit(configService);
  const rawLimit = pagination.limit ?? defaultLimit;
  const rawOffset = pagination.offset ?? 0;

  const limit = clampLimit(Math.max(1, rawLimit), configService);
  const offset = Math.max(0, rawOffset);
  const page = Math.floor(offset / limit) + 1;

  return { page, limit, offset };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
  nextCursor?: number
): PaginationMeta => {
  const totalPages = total >= 0 ? Math.ceil(total / limit) : 0;
  const meta: PaginationMeta = {
    page,
    limit,
    total: total >= 0 ? total : 0,
    totalPages,
    hasNext: total >= 0 ? page < totalPages : (nextCursor !== undefined),
    hasPrev: page > 1,
  };
  if (nextCursor !== undefined) {
    meta.next_cursor = nextCursor;
  }
  return meta;
};
