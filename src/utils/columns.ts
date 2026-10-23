import type { Order } from '../types/order'
import {
  CHANNEL_LABELS,
  PAYMENT_METHOD_LABELS,
  REGION_LABELS,
  STATUS_LABELS,
  formatAmount,
  formatDateTime,
  formatPriority,
} from './format'

export type Column = {
  id: keyof Order
  label: string
  /** Default width in pixels. */
  width: number
  align: 'left' | 'right'
  /** Text that may be cut short in the grid; the full value shows on hover. */
  longText?: boolean
  format: (order: Order) => string
}

/** The grid's columns, in display order. */
export const COLUMNS: Column[] = [
  { id: 'id', label: 'Order ID', width: 136, align: 'left', format: (order) => order.id },
  {
    id: 'customerName',
    label: 'Customer',
    width: 168,
    align: 'left',
    longText: true,
    format: (order) => order.customerName,
  },
  { id: 'status', label: 'Status', width: 128, align: 'left', format: (order) => STATUS_LABELS[order.status] },
  { id: 'amount', label: 'Amount', width: 128, align: 'right', format: (order) => formatAmount(order.amount) },
  {
    id: 'createdAt',
    label: 'Created (IST)',
    width: 168,
    align: 'left',
    format: (order) => formatDateTime(order.createdAt),
  },
  {
    id: 'updatedAt',
    label: 'Updated (IST)',
    width: 168,
    align: 'left',
    format: (order) => (order.updatedAt === null ? '—' : formatDateTime(order.updatedAt)),
  },
  { id: 'priority', label: 'Priority', width: 88, align: 'left', format: (order) => formatPriority(order.priority) },
  { id: 'region', label: 'Region', width: 112, align: 'left', format: (order) => REGION_LABELS[order.region] },
  { id: 'channel', label: 'Channel', width: 96, align: 'left', format: (order) => CHANNEL_LABELS[order.channel] },
  {
    id: 'paymentMethod',
    label: 'Payment',
    width: 120,
    align: 'left',
    format: (order) => PAYMENT_METHOD_LABELS[order.paymentMethod],
  },
  { id: 'itemCount', label: 'Items', width: 72, align: 'right', format: (order) => String(order.itemCount) },
  {
    id: 'customerEmail',
    label: 'Email',
    width: 240,
    align: 'left',
    longText: true,
    format: (order) => order.customerEmail,
  },
  { id: 'notes', label: 'Notes', width: 320, align: 'left', longText: true, format: (order) => order.notes },
]
