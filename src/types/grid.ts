import type { Order } from './order'

/** The grid cell with keyboard focus. `orderId` is null for the header row. */
export type FocusedCell = {
  orderId: string | null
  column: keyof Order
}
