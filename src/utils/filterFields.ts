import {
  NO_PRIORITY,
  type DateOperator,
  type FilterField,
  type NumberOperator,
  type OptionField,
  type TextOperator,
} from '../types/filter'
import { CHANNELS, ORDER_STATUSES, PAYMENT_METHODS, PRIORITIES, REGIONS } from '../types/order'
import { CHANNEL_LABELS, PAYMENT_METHOD_LABELS, REGION_LABELS, STATUS_LABELS, formatPriority } from './format'

export type FilterOption = {
  value: string
  label: string
}

/** The fields a condition can use, in the same order and with the same labels as the grid's columns. */
export const FILTER_FIELDS: { field: FilterField; label: string }[] = [
  { field: 'id', label: 'Order ID' },
  { field: 'customerName', label: 'Customer' },
  { field: 'status', label: 'Status' },
  { field: 'amount', label: 'Amount' },
  { field: 'createdAt', label: 'Created (IST)' },
  { field: 'updatedAt', label: 'Updated (IST)' },
  { field: 'priority', label: 'Priority' },
  { field: 'region', label: 'Region' },
  { field: 'channel', label: 'Channel' },
  { field: 'paymentMethod', label: 'Payment' },
  { field: 'itemCount', label: 'Items' },
  { field: 'customerEmail', label: 'Email' },
  { field: 'notes', label: 'Notes' },
]

// New conditions start on Status, like the first condition in the design.
export const DEFAULT_FILTER_FIELD: FilterField = 'status'

export const OPERATOR_LABELS: Record<TextOperator | NumberOperator | DateOperator, string> = {
  contains: 'contains',
  notContains: 'does not contain',
  equals: 'equals',
  greaterThan: 'greater than',
  lessThan: 'less than',
  between: 'between',
  before: 'before',
  after: 'after',
}

/** The choices shown as pills for each fixed-value field. */
export const FIELD_OPTIONS: Record<OptionField, FilterOption[]> = {
  status: ORDER_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
  region: REGIONS.map((region) => ({ value: region, label: REGION_LABELS[region] })),
  channel: CHANNELS.map((channel) => ({ value: channel, label: CHANNEL_LABELS[channel] })),
  paymentMethod: PAYMENT_METHODS.map((method) => ({ value: method, label: PAYMENT_METHOD_LABELS[method] })),
  // Data-notes rule 8: orders without a priority must be selectable as "None".
  priority: [
    ...PRIORITIES.map((priority) => ({ value: String(priority), label: formatPriority(priority) })),
    { value: NO_PRIORITY, label: formatPriority(null) },
  ],
}
