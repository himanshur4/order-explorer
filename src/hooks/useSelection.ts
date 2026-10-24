import { useRef, useState } from 'react'
import type { Order } from '../types/order'
import { addAll, addRange, removeAll, toggleId } from '../utils/selection'

/**
 * Row selection, stored as order IDs so it survives sorting and filtering.
 * A click toggles one row; Shift+click adds every row from the last clicked one.
 * `orders` is the list in the order it is currently shown; `initialIds` come from the link.
 */
export function useSelection(orders: Order[], initialIds: Set<string>) {
  const [selectedIds, setSelectedIds] = useState(initialIds)
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

  // Selects every shown row, or unselects them all if they already are. Rows the filter hides
  // keep their state, like everywhere else in the selection.
  function toggleAllShown() {
    setSelectedIds((current) =>
      orders.every((order) => current.has(order.id)) ? removeAll(current, orders) : addAll(current, orders),
    )
    lastClickedId.current = null
  }

  function clearSelection() {
    setSelectedIds(new Set())
    lastClickedId.current = null
  }

  return { selectedIds, handleRowClick, toggleAllShown, clearSelection }
}
