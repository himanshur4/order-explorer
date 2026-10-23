import type { Order } from '../types/order'
import { dedupeOrders } from '../utils/dedupeOrders'
import { normalizeOrders } from '../utils/normalizeOrders'

/** What the loader worker sends back to the page. */
export type LoaderMessage =
  | { type: 'ready'; orders: Order[] }
  | { type: 'error'; message: string }

// This runs in a Web Worker, so parsingJSON and cleaning records never blocks the page.
async function loadOrders(): Promise<LoaderMessage> {
  try {
    const response = await fetch('/orders.json')
    if (!response.ok) {
      return { type: 'error', message: `orders.json could not be loaded (HTTP ${response.status}).` }
    }
    // Dev and preview servers answer a missing file with the app's HTML page and status 200, so check that JSON actually came back.
    if (!response.headers.get('content-type')?.includes('application/json')) {
      return { type: 'error', message: 'orders.json was not found.' }
    }
    const raw: unknown = await response.json()
    return { type: 'ready', orders: dedupeOrders(normalizeOrders(raw).orders) }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { type: 'error', message: 'orders.json is not valid JSON.' }
    }
    const message = error instanceof Error ? error.message : 'Something went wrong while loading orders.'
    return { type: 'error', message }
  }
}

loadOrders().then((message) => self.postMessage(message))
