import {
  NO_PRIORITY,
  type Condition,
  type DateCondition,
  type Filter,
  type NumberCondition,
  type OptionCondition,
  type OptionField,
  type TextCondition,
} from '../types/filter'
import type { Order } from '../types/order'
import { IST_OFFSET_MS } from './format'
import { parseTimestamp } from './parseTimestamp'

type Matcher = (order: Order) => boolean

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Keeps the orders that match every group; an order matches a group when it
 * matches any of the group's conditions. Conditions that are not filled in yet
 * are ignored, so an empty filter returns the same array.
 */
export function filterOrders(orders: Order[], filter: Filter): Order[] {
  const groups = filter
    .map((group) => group.conditions.map(toMatcher).filter((matcher) => matcher !== null))
    .filter((matchers) => matchers.length > 0)
  if (groups.length === 0) return orders
  return orders.filter((order) => groups.every((matchers) => matchers.some((matches) => matches(order))))
}

/** False while a condition is not filled in enough to be used, so it is ignored. */
export function isConditionComplete(condition: Condition): boolean {
  return toMatcher(condition) !== null
}

// The typed values are read here once per filter change, not once per order.
function toMatcher(condition: Condition): Matcher | null {
  switch (condition.kind) {
    case 'text':
      return textMatcher(condition)
    case 'number':
      return numberMatcher(condition)
    case 'date':
      return dateMatcher(condition)
    case 'option':
      return optionMatcher(condition)
  }
}

// Ignores capital letters and spaces around the typed text.
function textMatcher({ field, operator, value }: TextCondition): Matcher | null {
  const search = value.trim().toLowerCase()
  if (search === '') return null
  switch (operator) {
    case 'contains':
      return (order) => order[field].toLowerCase().includes(search)
    case 'notContains':
      return (order) => !order[field].toLowerCase().includes(search)
    case 'equals':
      return (order) => order[field].toLowerCase() === search
  }
}

function numberMatcher(condition: NumberCondition): Matcher | null {
  const { field, operator } = condition
  const value = parseNumber(condition.value)
  if (value === null) return null
  switch (operator) {
    case 'equals':
      return (order) => order[field] === value
    case 'greaterThan':
      return (order) => order[field] > value
    case 'lessThan':
      return (order) => order[field] < value
    case 'between': {
      const valueTo = parseNumber(condition.valueTo)
      if (valueTo === null) return null
      // Both ends are included, and they can be typed in either order.
      const low = Math.min(value, valueTo)
      const high = Math.max(value, valueTo)
      return (order) => order[field] >= low && order[field] <= high
    }
  }
}

function parseNumber(text: string): number | null {
  if (text.trim() === '') return null
  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

// Days are IST days, as shown in the grid. Each operator becomes a time range
// [from, to): "before" and "after" leave the chosen day out, "between" includes
// both chosen days.
function dateMatcher(condition: DateCondition): Matcher | null {
  const { field, operator } = condition
  const dayStart = istDayStart(condition.value)
  if (dayStart === null) return null

  let from = -Infinity
  let to = Infinity
  if (operator === 'before') {
    to = dayStart
  } else if (operator === 'after') {
    from = dayStart + DAY_MS
  } else {
    const dayStartTo = istDayStart(condition.valueTo)
    if (dayStartTo === null) return null
    from = Math.min(dayStart, dayStartTo)
    to = Math.max(dayStart, dayStartTo) + DAY_MS
  }

  // An order that was never updated matches no condition on the updated date.
  return (order) => {
    const time = order[field]
    return time !== null && time >= from && time < to
  }
}

/** When a day ("yyyy-mm-dd" from a date input) starts in IST; null if empty or not a real date. */
function istDayStart(day: string): number | null {
  const utcMidnight = parseTimestamp(`${day}T00:00:00Z`)
  return utcMidnight === null ? null : utcMidnight - IST_OFFSET_MS
}

function optionMatcher({ field, values }: OptionCondition): Matcher | null {
  if (values.length === 0) return null
  const chosen = new Set(values)
  return (order) => chosen.has(optionValue(order, field))
}

function optionValue(order: Order, field: OptionField): string {
  if (field === 'priority') return order.priority === null ? NO_PRIORITY : String(order.priority)
  return order[field]
}
