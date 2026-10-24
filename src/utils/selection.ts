import type { Order } from '../types/order'

/** Selects the order if it isn't selected, otherwise unselects it. Returns a new set. */
export function toggleId(selected: Set<string>, id: string): Set<string> {
  const next = new Set(selected)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  return next
}

/** Adds every order in `orders` to the selection. Returns a new set. */
export function addAll(selected: Set<string>, orders: Order[]): Set<string> {
  const next = new Set(selected)
  for (const order of orders) next.add(order.id)
  return next
}

/** Removes every order in `orders` from the selection; other selected orders stay. Returns a new set. */
export function removeAll(selected: Set<string>, orders: Order[]): Set<string> {
  const next = new Set(selected)
  for (const order of orders) next.delete(order.id)
  return next
}

/**
 * Adds every order from `fromId` to `toId` (both included, in the order shown) to
 * the selection. If `fromId` is no longer shown, only `toId` is added.
 */
export function addRange(selected: Set<string>, orders: Order[], fromId: string, toId: string): Set<string> {
  const next = new Set(selected)
  const toIndex = orders.findIndex((order) => order.id === toId)
  if (toIndex === -1) return next

  const fromIndex = orders.findIndex((order) => order.id === fromId)
  const first = fromIndex === -1 ? toIndex : Math.min(fromIndex, toIndex)
  const last = fromIndex === -1 ? toIndex : Math.max(fromIndex, toIndex)
  for (let index = first; index <= last; index++) {
    next.add(orders[index].id)
  }
  return next
}
