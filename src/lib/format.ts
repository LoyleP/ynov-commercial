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

const dayMonth = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const dayMonthYear = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const monthYear = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const shortMonthYear = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});

const at = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const formatDay = (iso: string) => dayMonth.format(at(iso));
export const formatMonth = (iso: string) =>
  monthYear.format(at(iso.length === 7 ? `${iso}-01` : iso));
export const formatMonthShort = (iso: string) => shortMonthYear.format(at(iso));

/** "1 oct. – 28 oct. 2026"; the year is written once when both ends share it. */
export function formatRange({ from, to }: { from: string; to: string }) {
  if (from === to) return dayMonthYear.format(at(from));
  const start =
    from.slice(0, 4) === to.slice(0, 4) ? dayMonth.format(at(from)) : dayMonthYear.format(at(from));
  return `${start} – ${dayMonthYear.format(at(to))}`;
}

const numericDate = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  timeZone: "UTC",
});
/** ISO `YYYY-MM-DD` as "28/10/26". */
export const formatDateNumeric = (iso: string) => numericDate.format(at(iso));
