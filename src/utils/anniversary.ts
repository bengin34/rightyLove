/**
 * Anniversary utility functions
 * Calculates relationship duration and upcoming anniversary dates
 */

export interface RelationshipDuration {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export interface NextAnniversary {
  date: Date;
  yearsCompleted: number;
  daysUntil: number;
  isToday: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
}

export interface AnniversaryMilestone {
  type: 'days' | 'months' | 'years';
  value: number;
  date: Date;
  daysUntil: number;
  label: string;
}

/**
 * Calculate the duration between two dates
 */
export function calculateDuration(startDate: Date, endDate: Date = new Date()): RelationshipDuration {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Reset time to midnight for accurate day calculations
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += previousMonth.getDate();
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days, totalDays };
}

/**
 * Get the next anniversary date
 */
export function getNextAnniversary(startDate: Date): NextAnniversary {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisYearAnniversary = new Date(today.getFullYear(), start.getMonth(), start.getDate());
  thisYearAnniversary.setHours(0, 0, 0, 0);

  let nextAnniversary: Date;
  let yearsCompleted: number;

  if (thisYearAnniversary.getTime() >= today.getTime()) {
    // Anniversary is still coming this year
    nextAnniversary = thisYearAnniversary;
    yearsCompleted = today.getFullYear() - start.getFullYear();
  } else {
    // Anniversary has passed, use next year
    nextAnniversary = new Date(today.getFullYear() + 1, start.getMonth(), start.getDate());
    yearsCompleted = today.getFullYear() - start.getFullYear() + 1;
  }

  const daysUntil = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isToday = daysUntil === 0;
  const isThisWeek = daysUntil <= 7 && daysUntil >= 0;
  const isThisMonth = daysUntil <= 30 && daysUntil >= 0;

  return {
    date: nextAnniversary,
    yearsCompleted,
    daysUntil,
    isToday,
    isThisWeek,
    isThisMonth,
  };
}

/**
 * Get upcoming milestones (100 days, 6 months, 1 year, etc.)
 */
export function getUpcomingMilestones(startDate: Date, limit: number = 3): AnniversaryMilestone[] {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const duration = calculateDuration(start, today);
  const milestones: AnniversaryMilestone[] = [];

  // Day milestones
  const dayMilestones = [100, 200, 365, 500, 1000, 1500, 2000, 3000, 5000, 10000];
  for (const days of dayMilestones) {
    if (duration.totalDays < days) {
      const milestoneDate = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      const daysUntil = Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      milestones.push({
        type: 'days',
        value: days,
        date: milestoneDate,
        daysUntil,
        label: `${days} days`,
      });
    }
  }

  // Month milestones (6 months, 18 months, etc.)
  const monthMilestones = [6, 18];
  const totalMonths = duration.years * 12 + duration.months;
  for (const months of monthMilestones) {
    if (totalMonths < months) {
      const milestoneDate = new Date(start);
      milestoneDate.setMonth(milestoneDate.getMonth() + months);
      const daysUntil = Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0) {
        milestones.push({
          type: 'months',
          value: months,
          date: milestoneDate,
          daysUntil,
          label: `${months} months`,
        });
      }
    }
  }

  // Year milestones
  for (let year = duration.years + 1; year <= duration.years + 5; year++) {
    const milestoneDate = new Date(start);
    milestoneDate.setFullYear(milestoneDate.getFullYear() + year);
    const daysUntil = Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil > 0) {
      milestones.push({
        type: 'years',
        value: year,
        date: milestoneDate,
        daysUntil,
        label: `${year} ${year === 1 ? 'year' : 'years'}`,
      });
    }
  }

  // Sort by days until and return top milestones
  return milestones
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, limit);
}

/**
 * Format duration as human-readable string
 */
export function formatDuration(
  duration: RelationshipDuration,
  options: { short?: boolean; locale?: string } = {}
): string {
  const { short = false, locale = 'en' } = options;

  const parts: string[] = [];

  if (duration.years > 0) {
    if (short) {
      parts.push(`${duration.years}y`);
    } else {
      parts.push(`${duration.years} ${duration.years === 1 ? 'year' : 'years'}`);
    }
  }

  if (duration.months > 0) {
    if (short) {
      parts.push(`${duration.months}m`);
    } else {
      parts.push(`${duration.months} ${duration.months === 1 ? 'month' : 'months'}`);
    }
  }

  if (duration.days > 0 || parts.length === 0) {
    if (short) {
      parts.push(`${duration.days}d`);
    } else {
      parts.push(`${duration.days} ${duration.days === 1 ? 'day' : 'days'}`);
    }
  }

  return parts.join(short ? ' ' : ', ');
}

/**
 * Format duration as a simple "X years, Y months" or "X days" string
 */
export function formatDurationSimple(duration: RelationshipDuration): string {
  if (duration.years > 0) {
    if (duration.months > 0) {
      return `${duration.years} ${duration.years === 1 ? 'year' : 'years'}, ${duration.months} ${duration.months === 1 ? 'month' : 'months'}`;
    }
    return `${duration.years} ${duration.years === 1 ? 'year' : 'years'}`;
  }

  if (duration.months > 0) {
    if (duration.days > 0) {
      return `${duration.months} ${duration.months === 1 ? 'month' : 'months'}, ${duration.days} ${duration.days === 1 ? 'day' : 'days'}`;
    }
    return `${duration.months} ${duration.months === 1 ? 'month' : 'months'}`;
  }

  return `${duration.days} ${duration.days === 1 ? 'day' : 'days'}`;
}

/**
 * Get reminder dates for an anniversary
 */
export function getAnniversaryReminders(anniversaryDate: Date): {
  oneMonthBefore: Date;
  oneWeekBefore: Date;
  oneDayBefore: Date;
  onDay: Date;
}[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextAnniversary = getNextAnniversary(anniversaryDate);
  const anniversary = nextAnniversary.date;

  const oneMonthBefore = new Date(anniversary);
  oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);

  const oneWeekBefore = new Date(anniversary);
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);

  const oneDayBefore = new Date(anniversary);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);

  return [{
    oneMonthBefore,
    oneWeekBefore,
    oneDayBefore,
    onDay: anniversary,
  }];
}

/**
 * Check if a date is a special milestone
 */
export function isSpecialMilestone(startDate: Date, checkDate: Date = new Date()): {
  isMilestone: boolean;
  milestoneType?: 'days' | 'months' | 'years';
  milestoneValue?: number;
} {
  const duration = calculateDuration(startDate, checkDate);

  // Check day milestones
  const specialDays = [100, 200, 365, 500, 1000, 1500, 2000, 3000, 5000, 10000];
  if (specialDays.includes(duration.totalDays)) {
    return {
      isMilestone: true,
      milestoneType: 'days',
      milestoneValue: duration.totalDays,
    };
  }

  // Check year anniversary (same month and day as start date)
  const start = new Date(startDate);
  const check = new Date(checkDate);
  if (start.getMonth() === check.getMonth() && start.getDate() === check.getDate()) {
    const years = check.getFullYear() - start.getFullYear();
    if (years > 0) {
      return {
        isMilestone: true,
        milestoneType: 'years',
        milestoneValue: years,
      };
    }
  }

  // Check 6-month milestone
  if (duration.months === 6 && duration.years === 0 && duration.days === 0) {
    return {
      isMilestone: true,
      milestoneType: 'months',
      milestoneValue: 6,
    };
  }

  return { isMilestone: false };
}
