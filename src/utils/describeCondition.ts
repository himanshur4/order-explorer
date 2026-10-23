import type { Condition } from '../types/filter'
import { FIELD_OPTIONS, FILTER_FIELDS, OPERATOR_LABELS } from './filterFields'
import { formatAmount, formatDay } from './format'

// Symbols keep number chips short, e.g. "Amount > ₹2,000.00".
const NUMBER_SYMBOLS = { equals: '=', greaterThan: '>', lessThan: '<' }

/**
 * The text of a filter chip, e.g. 'Customer contains "priya"' or
 * "Status: Shipped, Delivered". Only for conditions that are filled in.
 */
export function describeCondition(condition: Condition): string {
  const label = FILTER_FIELDS.find((item) => item.field === condition.field)?.label ?? condition.field

  switch (condition.kind) {
    case 'text':
      return `${label} ${OPERATOR_LABELS[condition.operator]} "${condition.value.trim()}"`
    case 'number': {
      const format = (value: number) =>
        condition.field === 'amount' ? formatAmount(value) : value.toLocaleString('en-IN')
      if (condition.operator === 'between') {
        // Shown in order, like the filter applies them, even if typed the other way round.
        const [low, high] = [Number(condition.value), Number(condition.valueTo)].sort((a, b) => a - b)
        return `${label} ${format(low)} – ${format(high)}`
      }
      return `${label} ${NUMBER_SYMBOLS[condition.operator]} ${format(Number(condition.value))}`
    }
    case 'date': {
      if (condition.operator === 'between') {
        const [from, to] = [condition.value, condition.valueTo].sort()
        return `${label} ${formatDay(from)} – ${formatDay(to)}`
      }
      return `${label} ${OPERATOR_LABELS[condition.operator]} ${formatDay(condition.value)}`
    }
    case 'option': {
      const picked = FIELD_OPTIONS[condition.field].filter((option) => condition.values.includes(option.value))
      return `${label}: ${picked.map((option) => option.label).join(', ')}`
    }
  }
}
