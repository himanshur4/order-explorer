import type { Order } from '../types/order'

/**
 * Keeps one order per ID (data-notes rule 7): the later updatedAt wins; if only
 * one record has an updatedAt, it wins; if neither has one, the later record in
 * the file wins. Expects orders in file order and keeps that order.
 */
export function dedupeOrders(orders: Order[]): Order[] {
  const keptById = new Map<string, Order>()
  for (const order of orders) {
    const kept = keptById.get(order.id)
    if (kept === undefined || shouldReplace(kept, order)) {
      keptById.set(order.id, order)
    }
  }
  return orders.filter((order) => keptById.get(order.id) === order)
}

// `later` comes after `earlier` in the file, so it also wins when both updatedAt values are equal.
function shouldReplace(earlier: Order, later: Order): boolean {
  if (earlier.updatedAt !== null && later.updatedAt !== null) {
    return later.updatedAt >= earlier.updatedAt
  }
  // Only one has an updatedAt: keep that one. Neither has one: keep the later record.
  return earlier.updatedAt === null
}
