import type { Channel, OrderStatus, PaymentMethod, Priority, Region } from '../types/order'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const REGION_LABELS: Record<Region, string> = {
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
  central: 'Central',
  northeast: 'Northeast',
}

export const CHANNEL_LABELS: Record<Channel, string> = {
  web: 'Web',
  app: 'App',
  phone: 'Phone',
  store: 'Store',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net banking',
  cod: 'COD',
  wallet: 'Wallet',
}

// Created once and reused, because building an Intl formatter is slow.
const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formats rupees in the Indian style, e.g. ₹1,23,456.50. */
export function formatAmount(amount: number): string {
  return rupeeFormatter.format(amount)
}

// IST is always UTC+5:30 (no daylight saving), so adding the offset and reading
// the UTC parts gives IST on any computer. Intl is not used here because it
// writes September as "Sept", which breaks the fixed-width date column.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Formats a timestamp in IST, e.g. "14 Mar 2025, 09:30". */
export function formatDateTime(timestamp: number): string {
  const ist = new Date(timestamp + IST_OFFSET_MS)
  const day = String(ist.getUTCDate()).padStart(2, '0')
  const hours = String(ist.getUTCHours()).padStart(2, '0')
  const minutes = String(ist.getUTCMinutes()).padStart(2, '0')
  return `${day} ${MONTHS[ist.getUTCMonth()]} ${ist.getUTCFullYear()}, ${hours}:${minutes}`
}

/** "P1" to "P3", or "None" when the order has no priority. */
export function formatPriority(priority: Priority | null): string {
  return priority === null ? 'None' : `P${priority}`
}
