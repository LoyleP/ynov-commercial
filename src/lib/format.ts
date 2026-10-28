const number = new Intl.NumberFormat("fr-FR");
const percent = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });
const longDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" });

export const formatNumber = (value: number) => number.format(value);
export const formatPercent = (ratio: number) => percent.format(ratio);
/** ISO `YYYY-MM-DD` shown as "28 octobre 2026". Dates are read at UTC midnight. */
export const formatDateLong = (iso: string) => longDate.format(new Date(`${iso}T00:00:00Z`));

const signedPercent = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});
const signedPoints = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

/** Change from `previous` to `value`, as a signed percentage ("+10,5 %"). */
export const formatChange = (value: number, previous: number) =>
  signedPercent.format(previous === 0 ? 0 : (value - previous) / previous);
/** Change between two ratios, in percentage points ("−0,7 pt"). */
export const formatPoints = (value: number, previous: number, unit: string) =>
  `${signedPoints.format((value - previous) * 100)} ${unit}`;
