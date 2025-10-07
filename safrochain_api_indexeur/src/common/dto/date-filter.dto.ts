import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsDateString,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

export enum DateRangeType {
  EXACT = "exact",
  RANGE = "range",
  RELATIVE = "relative",
}

export enum RelativeDateUnit {
  MINUTES = "minutes",
  HOURS = "hours",
  DAYS = "days",
  WEEKS = "weeks",
  MONTHS = "months",
  YEARS = "years",
}

export class DateFilterDto {
  @ApiProperty({
    description: "Filter records from this date (ISO 8601 format)",
    required: false,
    example: "2023-01-01T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiProperty({
    description: "Filter records until this date (ISO 8601 format)",
    required: false,
    example: "2023-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @ApiProperty({
    description: "Filter by exact date (ISO 8601 format)",
    required: false,
    example: "2023-06-15T12:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  date_exact?: string;

  @ApiProperty({
    description: "Filter by specific year",
    required: false,
    example: 2023,
    minimum: 2020,
    maximum: 2030,
  })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2030)
  @Type(() => Number)
  year?: number;

  @ApiProperty({
    description: "Filter by specific month (1-12)",
    required: false,
    example: 6,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @ApiProperty({
    description: "Filter by specific day of month (1-31)",
    required: false,
    example: 15,
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  day?: number;

  @ApiProperty({
    description: "Filter by specific day of week (0-6, Sunday=0)",
    required: false,
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  @Type(() => Number)
  day_of_week?: number;

  @ApiProperty({
    description: "Filter by specific hour (0-23)",
    required: false,
    example: 14,
    minimum: 0,
    maximum: 23,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  @Type(() => Number)
  hour?: number;

  @ApiProperty({
    description: "Filter by specific minute (0-59)",
    required: false,
    example: 30,
    minimum: 0,
    maximum: 59,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(59)
  @Type(() => Number)
  minute?: number;

  @ApiProperty({
    description: "Filter by specific second (0-59)",
    required: false,
    example: 45,
    minimum: 0,
    maximum: 59,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(59)
  @Type(() => Number)
  second?: number;

  @ApiProperty({
    description: "Filter by time range - start time (HH:MM:SS format)",
    required: false,
    example: "09:00:00",
  })
  @IsOptional()
  @IsString()
  time_from?: string;

  @ApiProperty({
    description: "Filter by time range - end time (HH:MM:SS format)",
    required: false,
    example: "17:00:00",
  })
  @IsOptional()
  @IsString()
  time_to?: string;

  @ApiProperty({
    description: "Filter records from N units ago (relative date)",
    required: false,
    example: 7,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  relative_value?: number;

  @ApiProperty({
    description: "Unit for relative date filtering",
    required: false,
    enum: RelativeDateUnit,
    example: RelativeDateUnit.DAYS,
  })
  @IsOptional()
  @IsEnum(RelativeDateUnit)
  relative_unit?: RelativeDateUnit;

  @ApiProperty({
    description: "Filter by date range type",
    required: false,
    enum: DateRangeType,
    example: DateRangeType.RANGE,
  })
  @IsOptional()
  @IsEnum(DateRangeType)
  date_range_type?: DateRangeType;

  @ApiProperty({
    description: "Filter by specific date patterns (YYYY-MM-DD format)",
    required: false,
    example: "2023-06-15",
  })
  @IsOptional()
  @IsString()
  date_pattern?: string;

  @ApiProperty({
    description: "Filter by date format (ISO, Unix timestamp, etc.)",
    required: false,
    example: "ISO",
  })
  @IsOptional()
  @IsString()
  date_format?: string;

  @ApiProperty({
    description: "Filter by timezone (IANA timezone identifier)",
    required: false,
    example: "UTC",
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: "Filter by business days only (exclude weekends)",
    required: false,
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  business_days_only?: boolean;

  @ApiProperty({
    description: "Filter by specific weekdays (comma-separated: 0-6)",
    required: false,
    example: "1,2,3,4,5",
  })
  @IsOptional()
  @IsString()
  weekdays?: string;

  @ApiProperty({
    description: "Filter by specific months (comma-separated: 1-12)",
    required: false,
    example: "1,2,3,4,5,6,7,8,9,10,11,12",
  })
  @IsOptional()
  @IsString()
  months?: string;

  @ApiProperty({
    description: "Filter by specific quarters (1-4)",
    required: false,
    example: "1,2,3,4",
  })
  @IsOptional()
  @IsString()
  quarters?: string;

  @ApiProperty({
    description: "Filter by specific years (comma-separated)",
    required: false,
    example: "2022,2023,2024",
  })
  @IsOptional()
  @IsString()
  years?: string;

  @ApiProperty({
    description:
      "Filter by date granularity (year, month, day, hour, minute, second)",
    required: false,
    example: "day",
  })
  @IsOptional()
  @IsString()
  granularity?: string;

  @ApiProperty({
    description: "Filter by date aggregation (daily, weekly, monthly, yearly)",
    required: false,
    example: "daily",
  })
  @IsOptional()
  @IsString()
  aggregation?: string;

  @ApiProperty({
    description: "Filter by seasonal patterns (spring, summer, fall, winter)",
    required: false,
    example: "summer",
  })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiProperty({
    description: "Filter by fiscal year (if applicable)",
    required: false,
    example: "2023",
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  fiscal_year?: number;

  @ApiProperty({
    description: "Filter by fiscal quarter (1-4)",
    required: false,
    example: 2,
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  fiscal_quarter?: number;

  @ApiProperty({
    description: "Filter by leap years only",
    required: false,
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  leap_years_only?: boolean;

  @ApiProperty({
    description: "Filter by specific date ranges (custom ranges)",
    required: false,
    example: "2023-01-01,2023-03-31,2023-07-01,2023-09-30",
  })
  @IsOptional()
  @IsString()
  custom_ranges?: string;

  @ApiProperty({
    description: "Filter by date intervals (every N days, weeks, months)",
    required: false,
    example: "7",
  })
  @IsOptional()
  @IsString()
  interval?: string;

  @ApiProperty({
    description: "Filter by date offset (days to add/subtract)",
    required: false,
    example: "-30",
  })
  @IsOptional()
  @IsString()
  date_offset?: string;

  @ApiProperty({
    description: "Filter by date validation (valid dates only)",
    required: false,
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  valid_dates_only?: boolean;
}

export class DateRangeDto {
  @ApiProperty({
    description: "Start date of the range",
    example: "2023-01-01T00:00:00Z",
  })
  start: string;

  @ApiProperty({
    description: "End date of the range",
    example: "2023-12-31T23:59:59Z",
  })
  end: string;

  @ApiProperty({
    description: "Label for the date range",
    example: "Q1 2023",
  })
  label?: string;
}

export class DateStatisticsDto {
  @ApiProperty({
    description: "Total count of records",
    example: 1000,
  })
  total_count: number;

  @ApiProperty({
    description: "Date range statistics",
    example: {
      earliest: "2023-01-01T00:00:00Z",
      latest: "2023-12-31T23:59:59Z",
      span_days: 365,
    },
  })
  date_range: {
    earliest: string;
    latest: string;
    span_days: number;
  };

  @ApiProperty({
    description: "Distribution by year",
    example: {
      "2023": 800,
      "2024": 200,
    },
  })
  by_year: Record<string, number>;

  @ApiProperty({
    description: "Distribution by month",
    example: {
      "2023-01": 100,
      "2023-02": 120,
    },
  })
  by_month: Record<string, number>;

  @ApiProperty({
    description: "Distribution by day of week",
    example: {
      "0": 150, // Sunday
      "1": 200, // Monday
    },
  })
  by_day_of_week: Record<string, number>;

  @ApiProperty({
    description: "Distribution by hour",
    example: {
      "9": 50,
      "10": 75,
    },
  })
  by_hour: Record<string, number>;

  @ApiProperty({
    description: "Peak activity periods",
    example: [
      {
        period: "2023-06-15",
        count: 150,
        type: "daily_peak",
      },
    ],
  })
  peak_periods: Array<{
    period: string;
    count: number;
    type: string;
  }>;
}
