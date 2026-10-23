import { ORDER_STATUSES, type Order } from '../types/order'
import type { Sort } from '../types/sort'
import { CHANNEL_LABELS, PAYMENT_METHOD_LABELS, REGION_LABELS } from './format'

/** Newest orders first. */
export const DEFAULT_SORT: Sort = { column: 'createdAt', direction: 'desc' }

function sortValue(order: Order, column: keyof Order): string | number | null {
  switch (column) {
    case 'status':
      return ORDER_STATUSES.indexOf(order.status)
    case 'region':
      return REGION_LABELS[order.region].toLowerCase()
    case 'channel':
      return CHANNEL_LABELS[order.channel].toLowerCase()
    case 'paymentMethod':
      return PAYMENT_METHOD_LABELS[order.paymentMethod].toLowerCase()
    case 'notes':
      return order.notes === '' ? null : order.notes.toLowerCase()
    default: {
      const value = order[column]
      return typeof value === 'string' ? value.toLowerCase() : value
    }
  }
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a === b) return 0
  return String(a) < String(b) ? -1 : 1
}

function compareIds(a: Order, b: Order): number {
  if (a.id === b.id) return 0
  return a.id < b.id ? -1 : 1
}

export function sortOrders(orders: Order[], sort: Sort): Order[] {
  const direction = sort.direction === 'asc' ? 1 : -1
  // Work out each order's sort value once, instead of twice in every comparison.
  const rows = orders.map((order) => ({ order, value: sortValue(order, sort.column) }))
  rows.sort((a, b) => {
    if (a.value === null || b.value === null) {
      if (a.value === b.value) return compareIds(a.order, b.order)
      return a.value === null ? 1 : -1
    }
    return direction * compareValues(a.value, b.value) || compareIds(a.order, b.order)
  })
  return rows.map((row) => row.order)
}

/** Clicking the sorted column reverses it; clicking another column sorts it ascending. */
export function toggleSort(current: Sort, column: keyof Order): Sort {
  if (current.column === column) {
    return { column, direction: current.direction === 'asc' ? 'desc' : 'asc' }
  }
  return { column, direction: 'asc' }
}
