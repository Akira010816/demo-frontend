/**
 * @param businessYear
 */
export const getYearAndMonths = (
  businessYear: BusinessYear
): Array<{ year: number; month: number }> => {
  const yearRange = businessYear.endYear - businessYear.startYear + 1
  return Array.from({ length: yearRange }, (_, v) => businessYear.startYear + v).flatMap((year) =>
    Array.from(
      {
        length:
          year === businessYear.startYear
            ? 12 - businessYear.startMonth + 1
            : year === businessYear.endYear
            ? businessYear.endMonth
            : 12,
      },
      (_, v) => (year === businessYear.startYear ? businessYear.startMonth + v : v + 1)
    ).map((month) => ({
      year,
      month,
    }))
  )
}
