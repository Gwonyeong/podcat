import * as cron from 'node-cron';

/**
 * Calculate the next run time based on a cron expression
 * @param cronExpression - The cron expression (e.g., "0 9 * * *")
 * @param fromDate - The date to calculate from (defaults to now)
 * @returns The next run date or null if the expression is invalid
 */
export function calculateNextRunTime(
  cronExpression: string,
  fromDate: Date = new Date()
): Date | null {
  try {
    // Validate the cron expression
    if (!cron.validate(cronExpression)) {
      console.error('Invalid cron expression:', cronExpression);
      return null;
    }

    // Parse the cron expression
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) {
      console.error('Cron expression must have 5 parts:', cronExpression);
      return null;
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // Start from the next minute to avoid immediate execution
    const nextDate = new Date(fromDate);
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);
    nextDate.setMinutes(nextDate.getMinutes() + 1);

    // Maximum iterations to prevent infinite loop
    const maxIterations = 366 * 24 * 60; // One year in minutes
    let iterations = 0;

    while (iterations < maxIterations) {
      if (matchesCronExpression(nextDate, minute, hour, dayOfMonth, month, dayOfWeek)) {
        return nextDate;
      }
      
      // Move to next minute
      nextDate.setMinutes(nextDate.getMinutes() + 1);
      iterations++;
    }

    console.error('Could not find next run time within a year for:', cronExpression);
    return null;
  } catch (error) {
    console.error('Error calculating next run time:', error);
    return null;
  }
}

/**
 * Check if a date matches a cron expression
 */
function matchesCronExpression(
  date: Date,
  minute: string,
  hour: string,
  dayOfMonth: string,
  month: string,
  dayOfWeek: string
): boolean {
  // Check minute
  if (!matchesCronField(date.getMinutes(), minute, 0, 59)) {
    return false;
  }

  // Check hour
  if (!matchesCronField(date.getHours(), hour, 0, 23)) {
    return false;
  }

  // Check day of month
  if (!matchesCronField(date.getDate(), dayOfMonth, 1, 31)) {
    return false;
  }

  // Check month (1-indexed in cron, 0-indexed in JS)
  if (!matchesCronField(date.getMonth() + 1, month, 1, 12)) {
    return false;
  }

  // Check day of week (0-7 in cron where 0 and 7 are Sunday, 0-6 in JS where 0 is Sunday)
  const jsDay = date.getDay();
  const cronDay = jsDay === 0 ? 7 : jsDay; // Convert Sunday from 0 to 7 for cron compatibility
  if (!matchesCronField(cronDay, dayOfWeek, 0, 7)) {
    return false;
  }

  return true;
}

/**
 * Check if a value matches a cron field
 */
function matchesCronField(value: number, field: string, min: number, max: number): boolean {
  // Handle wildcard
  if (field === '*') {
    return true;
  }

  // Handle step values (e.g., */5)
  if (field.includes('/')) {
    const [range, step] = field.split('/');
    const stepValue = parseInt(step);
    
    if (range === '*') {
      return value % stepValue === 0;
    } else if (range.includes('-')) {
      const [rangeMin, rangeMax] = range.split('-').map(Number);
      if (value < rangeMin || value > rangeMax) {
        return false;
      }
      return (value - rangeMin) % stepValue === 0;
    }
  }

  // Handle ranges (e.g., 1-5)
  if (field.includes('-')) {
    const [rangeMin, rangeMax] = field.split('-').map(Number);
    return value >= rangeMin && value <= rangeMax;
  }

  // Handle lists (e.g., 1,3,5)
  if (field.includes(',')) {
    const values = field.split(',').map(Number);
    return values.includes(value);
  }

  // Handle single value
  const fieldValue = parseInt(field);
  
  // Special case for day of week (0 and 7 both mean Sunday)
  if (min === 0 && max === 7 && (fieldValue === 0 || fieldValue === 7) && (value === 0 || value === 7)) {
    return true;
  }
  
  return value === fieldValue;
}

/**
 * Get a human-readable description of when the next run will be
 */
export function getNextRunDescription(nextRunAt: Date | null): string {
  if (!nextRunAt) {
    return '다음 실행 시간 없음';
  }

  const now = new Date();
  const diff = nextRunAt.getTime() - now.getTime();
  
  if (diff < 0) {
    return '곧 실행 예정';
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}일 후 실행`;
  } else if (hours > 0) {
    return `${hours}시간 후 실행`;
  } else if (minutes > 0) {
    return `${minutes}분 후 실행`;
  } else {
    return '1분 이내 실행';
  }
}