/**
 * Get available years for selection in dropdowns
 * @param options Configuration options
 * @param options.startYear The earliest year to include (default: 2023)
 * @param options.yearsAhead How many years beyond current year to include (default: 1)
 * @returns Array of years from startYear to (currentYear + yearsAhead)
 */
export function getAvailableYears(options?: { startYear?: number; yearsAhead?: number }): number[] {
  const currentYear = new Date().getFullYear();
  const startYear = options?.startYear ?? 2023;
  const yearsAhead = options?.yearsAhead ?? 1; // Show current year + 1 year ahead by default

  const endYear = currentYear + yearsAhead;

  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  return years;
}

/**
 * Get the default year to select (current year if available, otherwise latest year)
 * @param availableYears Array of available years
 * @returns The default year to select
 */
export function getDefaultYear(availableYears: number[]): number {
  if (availableYears.length === 0) {
    return new Date().getFullYear();
  }

  const currentYear = new Date().getFullYear();
  
  // If current year is in the list, use it
  if (availableYears.includes(currentYear)) {
    return currentYear;
  }

  // Otherwise use the latest available year
  return Math.max(...availableYears);
}

