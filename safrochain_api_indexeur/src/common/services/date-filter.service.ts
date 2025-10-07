import { Injectable } from "@nestjs/common";
import { SelectQueryBuilder } from "typeorm";
import { DateFilterDto, RelativeDateUnit } from "../dto/date-filter.dto";

@Injectable()
export class DateFilterService {
  /**
   * Apply comprehensive date filtering to a query builder
   */
  applyDateFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    dateFilters: DateFilterDto,
    timestampField: string = "timestamp"
  ): SelectQueryBuilder<T> {
    if (!dateFilters) {
      return queryBuilder;
    }

    // Basic date range filtering
    if (dateFilters.date_from) {
      queryBuilder.andWhere(`${timestampField} >= :dateFrom`, {
        dateFrom: new Date(dateFilters.date_from),
      });
    }

    if (dateFilters.date_to) {
      queryBuilder.andWhere(`${timestampField} <= :dateTo`, {
        dateTo: new Date(dateFilters.date_to),
      });
    }

    // Exact date filtering
    if (dateFilters.date_exact) {
      const exactDate = new Date(dateFilters.date_exact);
      const startOfDay = new Date(exactDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(exactDate);
      endOfDay.setHours(23, 59, 59, 999);

      queryBuilder.andWhere(`${timestampField} >= :exactDateStart`, {
        exactDateStart: startOfDay,
      });
      queryBuilder.andWhere(`${timestampField} <= :exactDateEnd`, {
        exactDateEnd: endOfDay,
      });
    }

    // Year filtering
    if (dateFilters.year) {
      queryBuilder.andWhere(`EXTRACT(YEAR FROM ${timestampField}) = :year`, {
        year: dateFilters.year,
      });
    }

    // Month filtering
    if (dateFilters.month) {
      queryBuilder.andWhere(`EXTRACT(MONTH FROM ${timestampField}) = :month`, {
        month: dateFilters.month,
      });
    }

    // Day filtering
    if (dateFilters.day) {
      queryBuilder.andWhere(`EXTRACT(DAY FROM ${timestampField}) = :day`, {
        day: dateFilters.day,
      });
    }

    // Day of week filtering
    if (dateFilters.day_of_week !== undefined) {
      queryBuilder.andWhere(
        `EXTRACT(DOW FROM ${timestampField}) = :dayOfWeek`,
        {
          dayOfWeek: dateFilters.day_of_week,
        }
      );
    }

    // Hour filtering
    if (dateFilters.hour !== undefined) {
      queryBuilder.andWhere(`EXTRACT(HOUR FROM ${timestampField}) = :hour`, {
        hour: dateFilters.hour,
      });
    }

    // Minute filtering
    if (dateFilters.minute !== undefined) {
      queryBuilder.andWhere(
        `EXTRACT(MINUTE FROM ${timestampField}) = :minute`,
        {
          minute: dateFilters.minute,
        }
      );
    }

    // Second filtering
    if (dateFilters.second !== undefined) {
      queryBuilder.andWhere(
        `EXTRACT(SECOND FROM ${timestampField}) = :second`,
        {
          second: dateFilters.second,
        }
      );
    }

    // Time range filtering
    if (dateFilters.time_from) {
      queryBuilder.andWhere(`TIME(${timestampField}) >= :timeFrom`, {
        timeFrom: dateFilters.time_from,
      });
    }

    if (dateFilters.time_to) {
      queryBuilder.andWhere(`TIME(${timestampField}) <= :timeTo`, {
        timeTo: dateFilters.time_to,
      });
    }

    // Relative date filtering
    if (dateFilters.relative_value && dateFilters.relative_unit) {
      const relativeDate = this.calculateRelativeDate(
        dateFilters.relative_value,
        dateFilters.relative_unit
      );
      queryBuilder.andWhere(`${timestampField} >= :relativeDate`, {
        relativeDate,
      });
    }

    // Business days only filtering
    if (dateFilters.business_days_only) {
      queryBuilder.andWhere(
        `EXTRACT(DOW FROM ${timestampField}) NOT IN (0, 6)`
      ); // Exclude Sunday (0) and Saturday (6)
    }

    // Weekdays filtering
    if (dateFilters.weekdays) {
      const weekdays = dateFilters.weekdays
        .split(",")
        .map((d) => parseInt(d.trim()));
      queryBuilder.andWhere(
        `EXTRACT(DOW FROM ${timestampField}) IN (:...weekdays)`,
        {
          weekdays,
        }
      );
    }

    // Months filtering
    if (dateFilters.months) {
      const months = dateFilters.months
        .split(",")
        .map((m) => parseInt(m.trim()));
      queryBuilder.andWhere(
        `EXTRACT(MONTH FROM ${timestampField}) IN (:...months)`,
        {
          months,
        }
      );
    }

    // Years filtering
    if (dateFilters.years) {
      const years = dateFilters.years.split(",").map((y) => parseInt(y.trim()));
      queryBuilder.andWhere(
        `EXTRACT(YEAR FROM ${timestampField}) IN (:...years)`,
        {
          years,
        }
      );
    }

    // Quarters filtering
    if (dateFilters.quarters) {
      const quarters = dateFilters.quarters
        .split(",")
        .map((q) => parseInt(q.trim()));
      queryBuilder.andWhere(
        `EXTRACT(QUARTER FROM ${timestampField}) IN (:...quarters)`,
        {
          quarters,
        }
      );
    }

    // Season filtering
    if (dateFilters.season) {
      const seasonMonths = this.getSeasonMonths(dateFilters.season);
      queryBuilder.andWhere(
        `EXTRACT(MONTH FROM ${timestampField}) IN (:...seasonMonths)`,
        {
          seasonMonths,
        }
      );
    }

    // Fiscal year filtering
    if (dateFilters.fiscal_year) {
      const fiscalYearStart = new Date(dateFilters.fiscal_year, 3, 1); // April 1st
      const fiscalYearEnd = new Date(dateFilters.fiscal_year + 1, 2, 31); // March 31st next year

      queryBuilder.andWhere(`${timestampField} >= :fiscalYearStart`, {
        fiscalYearStart,
      });
      queryBuilder.andWhere(`${timestampField} <= :fiscalYearEnd`, {
        fiscalYearEnd,
      });
    }

    // Fiscal quarter filtering
    if (dateFilters.fiscal_quarter) {
      const quarterMonths = this.getFiscalQuarterMonths(
        dateFilters.fiscal_quarter
      );
      queryBuilder.andWhere(
        `EXTRACT(MONTH FROM ${timestampField}) IN (:...quarterMonths)`,
        {
          quarterMonths,
        }
      );
    }

    // Leap years only filtering
    if (dateFilters.leap_years_only) {
      queryBuilder.andWhere(`EXTRACT(YEAR FROM ${timestampField}) % 4 = 0`);
      queryBuilder.andWhere(
        `(EXTRACT(YEAR FROM ${timestampField}) % 100 != 0 OR EXTRACT(YEAR FROM ${timestampField}) % 400 = 0)`
      );
    }

    // Custom ranges filtering
    if (dateFilters.custom_ranges) {
      const ranges = this.parseCustomRanges(dateFilters.custom_ranges);
      const conditions = ranges.map((range, index) => {
        queryBuilder.setParameter(`customRangeStart${index}`, range.start);
        queryBuilder.setParameter(`customRangeEnd${index}`, range.end);
        return `(${timestampField} >= :customRangeStart${index} AND ${timestampField} <= :customRangeEnd${index})`;
      });

      if (conditions.length > 0) {
        queryBuilder.andWhere(`(${conditions.join(" OR ")})`);
      }
    }

    // Date offset filtering
    if (dateFilters.date_offset) {
      const offsetDays = parseInt(dateFilters.date_offset);
      const offsetDate = new Date();
      offsetDate.setDate(offsetDate.getDate() + offsetDays);

      queryBuilder.andWhere(`${timestampField} >= :offsetDate`, {
        offsetDate,
      });
    }

    // Valid dates only filtering
    if (dateFilters.valid_dates_only) {
      queryBuilder.andWhere(`${timestampField} IS NOT NULL`);
      queryBuilder.andWhere(`${timestampField} != '1970-01-01 00:00:00'`); // Exclude Unix epoch
    }

    return queryBuilder;
  }

  /**
   * Calculate relative date based on value and unit
   */
  private calculateRelativeDate(value: number, unit: RelativeDateUnit): Date {
    const now = new Date();
    const relativeDate = new Date(now);

    switch (unit) {
      case RelativeDateUnit.MINUTES:
        relativeDate.setMinutes(relativeDate.getMinutes() - value);
        break;
      case RelativeDateUnit.HOURS:
        relativeDate.setHours(relativeDate.getHours() - value);
        break;
      case RelativeDateUnit.DAYS:
        relativeDate.setDate(relativeDate.getDate() - value);
        break;
      case RelativeDateUnit.WEEKS:
        relativeDate.setDate(relativeDate.getDate() - value * 7);
        break;
      case RelativeDateUnit.MONTHS:
        relativeDate.setMonth(relativeDate.getMonth() - value);
        break;
      case RelativeDateUnit.YEARS:
        relativeDate.setFullYear(relativeDate.getFullYear() - value);
        break;
    }

    return relativeDate;
  }

  /**
   * Get months for a given season
   */
  private getSeasonMonths(season: string): number[] {
    switch (season.toLowerCase()) {
      case "spring":
        return [3, 4, 5]; // March, April, May
      case "summer":
        return [6, 7, 8]; // June, July, August
      case "fall":
      case "autumn":
        return [9, 10, 11]; // September, October, November
      case "winter":
        return [12, 1, 2]; // December, January, February
      default:
        return [];
    }
  }

  /**
   * Get months for a fiscal quarter
   */
  private getFiscalQuarterMonths(quarter: number): number[] {
    switch (quarter) {
      case 1: // Q1: April, May, June
        return [4, 5, 6];
      case 2: // Q2: July, August, September
        return [7, 8, 9];
      case 3: // Q3: October, November, December
        return [10, 11, 12];
      case 4: // Q4: January, February, March
        return [1, 2, 3];
      default:
        return [];
    }
  }

  /**
   * Parse custom date ranges
   */
  private parseCustomRanges(
    customRanges: string
  ): Array<{ start: Date; end: Date }> {
    const ranges: Array<{ start: Date; end: Date }> = [];
    const pairs = customRanges.split(",");

    for (let i = 0; i < pairs.length; i += 2) {
      if (i + 1 < pairs.length) {
        const start = new Date(pairs[i].trim());
        const end = new Date(pairs[i + 1].trim());

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          ranges.push({ start, end });
        }
      }
    }

    return ranges;
  }

  /**
   * Get date statistics for a given query
   */
  async getDateStatistics<T>(
    queryBuilder: SelectQueryBuilder<T>,
    timestampField: string = "timestamp"
  ): Promise<any> {
    // Get total count
    const totalCount = await queryBuilder.getCount();

    // Get date range
    const dateRangeQuery = queryBuilder.clone();
    const dateRangeResult = await dateRangeQuery
      .select([
        `MIN(${timestampField}) as earliest`,
        `MAX(${timestampField}) as latest`,
      ])
      .getRawOne();

    // Get distribution by year
    const yearQuery = queryBuilder.clone();
    const yearResults = await yearQuery
      .select([
        `EXTRACT(YEAR FROM ${timestampField}) as year`,
        "COUNT(*) as count",
      ])
      .groupBy(`EXTRACT(YEAR FROM ${timestampField})`)
      .orderBy("year", "ASC")
      .getRawMany();

    const byYear: Record<string, number> = {};
    yearResults.forEach((result) => {
      byYear[result.year.toString()] = parseInt(result.count);
    });

    // Get distribution by month
    const monthQuery = queryBuilder.clone();
    const monthResults = await monthQuery
      .select([
        `TO_CHAR(${timestampField}, 'YYYY-MM') as month`,
        "COUNT(*) as count",
      ])
      .groupBy(`TO_CHAR(${timestampField}, 'YYYY-MM')`)
      .orderBy("month", "ASC")
      .getRawMany();

    const byMonth: Record<string, number> = {};
    monthResults.forEach((result) => {
      byMonth[result.month] = parseInt(result.count);
    });

    // Get distribution by day of week
    const dowQuery = queryBuilder.clone();
    const dowResults = await dowQuery
      .select([
        `EXTRACT(DOW FROM ${timestampField}) as day_of_week`,
        "COUNT(*) as count",
      ])
      .groupBy(`EXTRACT(DOW FROM ${timestampField})`)
      .orderBy("day_of_week", "ASC")
      .getRawMany();

    const byDayOfWeek: Record<string, number> = {};
    dowResults.forEach((result) => {
      byDayOfWeek[result.day_of_week.toString()] = parseInt(result.count);
    });

    // Get distribution by hour
    const hourQuery = queryBuilder.clone();
    const hourResults = await hourQuery
      .select([
        `EXTRACT(HOUR FROM ${timestampField}) as hour`,
        "COUNT(*) as count",
      ])
      .groupBy(`EXTRACT(HOUR FROM ${timestampField})`)
      .orderBy("hour", "ASC")
      .getRawMany();

    const byHour: Record<string, number> = {};
    hourResults.forEach((result) => {
      byHour[result.hour.toString()] = parseInt(result.count);
    });

    // Calculate span in days
    let spanDays = 0;
    if (dateRangeResult.earliest && dateRangeResult.latest) {
      const earliest = new Date(dateRangeResult.earliest);
      const latest = new Date(dateRangeResult.latest);
      spanDays = Math.ceil(
        (latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Find peak periods (top 5 days by count)
    const peakQuery = queryBuilder.clone();
    const peakResults = await peakQuery
      .select([`DATE(${timestampField}) as period`, "COUNT(*) as count"])
      .groupBy(`DATE(${timestampField})`)
      .orderBy("count", "DESC")
      .limit(5)
      .getRawMany();

    const peakPeriods = peakResults.map((result) => ({
      period: result.period,
      count: parseInt(result.count),
      type: "daily_peak",
    }));

    return {
      total_count: totalCount,
      date_range: {
        earliest: dateRangeResult.earliest,
        latest: dateRangeResult.latest,
        span_days: spanDays,
      },
      by_year: byYear,
      by_month: byMonth,
      by_day_of_week: byDayOfWeek,
      by_hour: byHour,
      peak_periods: peakPeriods,
    };
  }

  /**
   * Generate date filter query parameters for Swagger documentation
   */
  getDateFilterQueryParams(): any[] {
    return [
      {
        name: "date_from",
        description: "Filter records from this date (ISO 8601 format)",
        required: false,
        example: "2023-01-01T00:00:00Z",
      },
      {
        name: "date_to",
        description: "Filter records until this date (ISO 8601 format)",
        required: false,
        example: "2023-12-31T23:59:59Z",
      },
      {
        name: "date_exact",
        description: "Filter by exact date (ISO 8601 format)",
        required: false,
        example: "2023-06-15T12:00:00Z",
      },
      {
        name: "year",
        description: "Filter by specific year",
        required: false,
        example: 2023,
      },
      {
        name: "month",
        description: "Filter by specific month (1-12)",
        required: false,
        example: 6,
      },
      {
        name: "day",
        description: "Filter by specific day of month (1-31)",
        required: false,
        example: 15,
      },
      {
        name: "day_of_week",
        description: "Filter by specific day of week (0-6, Sunday=0)",
        required: false,
        example: 1,
      },
      {
        name: "hour",
        description: "Filter by specific hour (0-23)",
        required: false,
        example: 14,
      },
      {
        name: "minute",
        description: "Filter by specific minute (0-59)",
        required: false,
        example: 30,
      },
      {
        name: "second",
        description: "Filter by specific second (0-59)",
        required: false,
        example: 45,
      },
      {
        name: "time_from",
        description: "Filter by time range - start time (HH:MM:SS format)",
        required: false,
        example: "09:00:00",
      },
      {
        name: "time_to",
        description: "Filter by time range - end time (HH:MM:SS format)",
        required: false,
        example: "17:00:00",
      },
      {
        name: "relative_value",
        description: "Filter records from N units ago (relative date)",
        required: false,
        example: 7,
      },
      {
        name: "relative_unit",
        description: "Unit for relative date filtering",
        required: false,
        example: "days",
        enum: ["minutes", "hours", "days", "weeks", "months", "years"],
      },
      {
        name: "business_days_only",
        description: "Filter by business days only (exclude weekends)",
        required: false,
        example: false,
      },
      {
        name: "weekdays",
        description: "Filter by specific weekdays (comma-separated: 0-6)",
        required: false,
        example: "1,2,3,4,5",
      },
      {
        name: "months",
        description: "Filter by specific months (comma-separated: 1-12)",
        required: false,
        example: "1,2,3,4,5,6,7,8,9,10,11,12",
      },
      {
        name: "years",
        description: "Filter by specific years (comma-separated)",
        required: false,
        example: "2022,2023,2024",
      },
      {
        name: "quarters",
        description: "Filter by specific quarters (1-4)",
        required: false,
        example: "1,2,3,4",
      },
      {
        name: "season",
        description:
          "Filter by seasonal patterns (spring, summer, fall, winter)",
        required: false,
        example: "summer",
      },
      {
        name: "fiscal_year",
        description: "Filter by fiscal year (if applicable)",
        required: false,
        example: 2023,
      },
      {
        name: "fiscal_quarter",
        description: "Filter by fiscal quarter (1-4)",
        required: false,
        example: 2,
      },
      {
        name: "leap_years_only",
        description: "Filter by leap years only",
        required: false,
        example: false,
      },
      {
        name: "custom_ranges",
        description: "Filter by specific date ranges (custom ranges)",
        required: false,
        example: "2023-01-01,2023-03-31,2023-07-01,2023-09-30",
      },
      {
        name: "date_offset",
        description: "Filter by date offset (days to add/subtract)",
        required: false,
        example: "-30",
      },
      {
        name: "valid_dates_only",
        description: "Filter by date validation (valid dates only)",
        required: false,
        example: true,
      },
    ];
  }
}
