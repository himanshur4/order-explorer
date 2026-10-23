// Allowed values for the fixed-value fields. They also become the options in the filter.
export const ORDER_STATUSES =['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
export const REGIONS = ['north', 'south', 'east', 'west', 'central', 'northeast'] as const
export const CHANNELS = ['web', 'app', 'phone', 'store'] as const
export const PAYMENT_METHODS = ['upi', 'card', 'netbanking', 'cod', 'wallet'] as const
export const PRIORITIES = [1, 2, 3] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type Region = (typeof REGIONS)[number]
export type Channel = (typeof CHANNELS)[number]
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
export type Priority = (typeof PRIORITIES)[number]

/** A clean order, as produced by normalizeOrders. The UI only ever works with this shape. */
export type Order = {
  id: string
  customerName: string
  customerEmail: string
  status: OrderStatus
  /** In rupees (v1 paise already converted). */
  amount: number
  currency: string
  /** Milliseconds since the Unix epoch (UTC). */
  createdAt: number
  /** Milliseconds since the Unix epoch (UTC); null when the record had none. */
  updatedAt: number | null
  region: Region
  channel: Channel
  /** 1 is highest; null when missing (shown as "None"). */
  priority: Priority | null
  paymentMethod: PaymentMethod
  itemCount: number
  /** Plain text, never rendered as HTML; '' when missing. */
  notes: string
}
