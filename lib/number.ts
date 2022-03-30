export const numberFormatter = new Intl.NumberFormat('ja-JP')

export const toFixed = (value: number, dp = 2): number => +parseFloat(String(value)).toFixed(dp)

export const calcByUnitAndFormat = (
  value: number | undefined,
  diffDigit: number,
  decLen: number
): number => {
  if (decLen < 0) decLen = 0
  if (decLen > 100) decLen = 100
  const res = toFixed((value || 0) * Math.pow(10, diffDigit), decLen)
  return res
}
