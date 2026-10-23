// Data-notes rule 4: ISO with or without the trailing Z is UTC, and dd/mm/yyyy
// (day first) is midnight UTC.
const ISO_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z?$/
const DAY_MONTH_YEAR = /^(\d{2})\/(\d{2})\/(\d{4})$/

type DateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  millisecond: number
}

// Date.UTC rolls impossible dates over (31 Feb becomes 3 Mar), so the result is
// converted back and rejected if any part changed.
function utcTimestamp({ year, month, day, hour, minute, second, millisecond }: DateParts): number | null {
  const timestamp = Date.UTC(year, month - 1, day, hour, minute, second, millisecond)

  const date = new Date(timestamp)
  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second

  return isRealDate ? timestamp : null
}

/**
 * Parses a timestamp in any of the four formats from data-notes.md (ISO with Z,
 * ISO without a zone, epoch seconds, dd/mm/yyyy) into milliseconds since the
 * Unix epoch, in UTC. Returns null for missing, unknown, or impossible values.
 *
 * `new Date(text)` is not used because it reads zone-less ISO as local time
 * and cannot read dd/mm/yyyy.
 */
export function parseTimestamp(value: unknown): number | null {
  // A number is epoch seconds.
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value * 1000 : null
  }

  if (typeof value !== 'string') return null

  const iso = ISO_DATE_TIME.exec(value)
  if (iso) {
    const [, year, month, day, hour, minute, second, fraction] = iso
    // ".5" means 500 ms, not 5 ms.
    const millisecond = Number((fraction ?? '').padEnd(3, '0'))
    return utcTimestamp({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      minute: Number(minute),
      second: Number(second),
      millisecond,
    })
  }

  const dayMonthYear = DAY_MONTH_YEAR.exec(value)
  if (dayMonthYear) {
    const [, day, month, year] = dayMonthYear
    return utcTimestamp({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
  }

  return null
}
