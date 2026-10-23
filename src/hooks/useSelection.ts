import { useRef, useState } from 'react'
import type { Order } from '../types/order'
import { addRange, toggleId } from '../utils/selection'

/**
 * Row selection, stored as order IDs so it survives sorting and filtering.
 * A click toggles one row; Shift+click adds every row from the last clicked one.
 * `orders` is the list in the order it is currently shown.
 */
export function useSelection(orders: Order[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  // The last clicked row. A ref, because remembering it never changes the screen.
  const lastClickedId = useRef<string | null>(null)

  function handleRowClick(orderId: string, shiftKey: boolean) {
    const fromId = lastClickedId.current
    if (shiftKey && fromId !== null) {
      setSelectedIds((current) => addRange(current, orders, fromId, orderId))
    } else {
      setSelectedIds((current) => toggleId(current, orderId))
    }
    lastClickedId.current = orderId
  }

  function clearSelection() {
    setSelectedIds(new Set())
    lastClickedId.current = null
  }

  return { selectedIds, handleRowClick, clearSelection }
}
