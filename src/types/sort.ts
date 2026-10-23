import type { Order } from './order'

export type SortDirection = 'asc' | 'desc'

export type Sort = {
  column: keyof Order
  direction: SortDirection
}
