import { CHANNELS, ORDER_STATUSES, PAYMENT_METHODS, PRIORITIES, REGIONS, type Order } from '../types/order'
import { parseTimestamp } from './parseTimestamp'

/** Clean orders, plus how many records could not be used. */
export type NormalizeResult = {
  orders: Order[]
  skipped: number
}

/**
 * Turns the parsed contents of orders.json into clean orders, in file order.
 * Records that don't match data-notes.md are skipped and counted.
 * Duplicate IDs are handled separately in dedupeOrders.ts file.
 */
export function normalizeOrders(raw: unknown): NormalizeResult {
  if (!Array.isArray(raw)) {
    throw new Error('orders.json should contain a list of orders.')
  }

  const records: unknown[] = raw
  const orders: Order[] = []
  let skipped = 0
  for (const record of records) {
    const order = normalizeOrder(record)
    if (order === null) {
      skipped += 1
    } else {
      orders.push(order)
    }
  }
  return { orders, skipped }
}

/** Normalizes one raw record, or returns null if it doesn't match data-notes.md. */
export function normalizeOrder(record: unknown): Order | null {
  if (!isPlainObject(record)) return null

  const version = record.schemaVersion
  if (version !== 1 && version !== 2) return null

  const id = readText(record.id)
  // v1 calls this field customer_name, v2 calls it customerName (rule 1).
  const customerName = readText(record.customerName ?? record.customer_name)
  const customerEmail = readText(record.customerEmail)
  const status = readOption(record.status, ORDER_STATUSES)
  const amount = readAmount(record.amount, version)
  const currency = readText(record.currency)
  const createdAt = parseTimestamp(record.createdAt)
  const updatedAt = isMissing(record.updatedAt) ? null : parseTimestamp(record.updatedAt)
  const region = readOption(record.region, REGIONS)
  const channel = readOption(record.channel, CHANNELS)
  const paymentMethod = readOption(record.paymentMethod, PAYMENT_METHODS)
  const priority = isMissing(record.priority) ? null : readOption(record.priority, PRIORITIES)
  const itemCount = typeof record.itemCount === 'number' && Number.isInteger(record.itemCount) ? record.itemCount : null
  const notes = isMissing(record.notes) ? '' : record.notes

  if (
    id === null ||
    customerName === null ||
    customerEmail === null ||
    status === null ||
    amount === null ||
    currency === null ||
    createdAt === null ||
    region === null ||
    channel === null ||
    paymentMethod === null ||
    itemCount === null ||
    typeof notes !== 'string'
  ) {
    return null
  }

  // updatedAt and priority may be missing, but a value that is there must be valid.
  if (updatedAt === null && !isMissing(record.updatedAt)) return null
  if (priority === null && !isMissing(record.priority)) return null

  return {
    id,
    customerName,
    customerEmail,
    status,
    amount,
    currency,
    createdAt,
    updatedAt,
    region,
    channel,
    priority,
    paymentMethod,
    itemCount,
    notes,
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// null and a missing field mean the same thing in this data (rule 5).
function isMissing(value: unknown): boolean {
  return value === null || value === undefined
}

// Trimming also fixes currency values like "INR " (rule 10).
function readText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text === '' ? null : text
}

// Text is compared in lowercase, so "SHIPPED" and "Shipped" both become "shipped" (rule 6).
function readOption<T extends string | number>(value: unknown, options: readonly T[]): T | null {
  const wanted = typeof value === 'string' ? value.trim().toLowerCase() : value
  return options.find((option) => option === wanted) ?? null
}

// v1 stores paise and v2 stores rupees (rule 2); some amounts are strings like "4599.5" (rule 3).
function readAmount(value: unknown, version: 1 | 2): number | null {
  const amount = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
  return version === 1 ? amount / 100 : amount
}
