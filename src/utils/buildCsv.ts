import type { Order } from '../types/order'
import {
  CHANNEL_LABELS,
  PAYMENT_METHOD_LABELS,
  REGION_LABELS,
  STATUS_LABELS,
  formatPriority,
  formatSortableDateTime,
} from './format'

type CsvColumn = {
  header: string
  value: (order: Order) => string
  /** Text typed by people, which could start like a spreadsheet formula. */
  freeText?: boolean
}

// Every export has these columns in this order, whatever the grid shows. The values are written
// for spreadsheets: the amount as a plain number, dates in IST they can sort, labels as on screen.
const CSV_COLUMNS: CsvColumn[] = [
  { header: 'Order ID', value: (order) => order.id },
  { header: 'Customer', value: (order) => order.customerName, freeText: true },
  { header: 'Status', value: (order) => STATUS_LABELS[order.status] },
  { header: 'Amount', value: (order) => order.amount.toFixed(2) },
  { header: 'Currency', value: (order) => order.currency },
  { header: 'Created (IST)', value: (order) => formatSortableDateTime(order.createdAt) },
  {
    header: 'Updated (IST)',
    value: (order) => (order.updatedAt === null ? '' : formatSortableDateTime(order.updatedAt)),
  },
  { header: 'Priority', value: (order) => formatPriority(order.priority) },
  { header: 'Region', value: (order) => REGION_LABELS[order.region] },
  { header: 'Channel', value: (order) => CHANNEL_LABELS[order.channel] },
  { header: 'Payment', value: (order) => PAYMENT_METHOD_LABELS[order.paymentMethod] },
  { header: 'Items', value: (order) => String(order.itemCount) },
  { header: 'Email', value: (order) => order.customerEmail, freeText: true },
  { header: 'Notes', value: (order) => order.notes, freeText: true },
]

/**
 * A CSV file (RFC 4180, CRLF line endings): a header row, then one row per order in the order
 * given. It starts with a byte order mark, so Excel reads the text as UTF-8.
 */
export function buildCsv(orders: Order[]): string {
  const rows = [CSV_COLUMNS.map((column) => column.header).join(',')]
  for (const order of orders) {
    rows.push(CSV_COLUMNS.map((column) => toCell(column.value(order), column.freeText)).join(','))
  }
  return '﻿' + rows.join('\r\n') + '\r\n'
}

/** A file name with the IST date and time, e.g. "orders-2026-10-24-1530.csv". */
export function csvFileName(now: number): string {
  const stamp = formatSortableDateTime(now)
  return `orders-${stamp.slice(0, 10)}-${stamp.slice(11, 13)}${stamp.slice(14, 16)}.csv`
}

function toCell(value: string, freeText = false): string {
  // A spreadsheet runs text starting with = + - or @ as a formula; a leading ' keeps it as text.
  const safe = freeText && /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  // Commas, quotes and line breaks are allowed inside quotes, where a quote is written twice.
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe
}
