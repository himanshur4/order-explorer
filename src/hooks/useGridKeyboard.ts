import { type FocusEvent, type KeyboardEvent, type RefObject, useState } from 'react'
import type { FocusedCell } from '../types/grid'
import type { Order } from '../types/order'
import type { GridColumn } from '../utils/columns'
import { HEADER_ROW, cellId, headerCellId, nextCellPosition, revealOffset } from '../utils/gridNavigation'

type GridKeyboardOptions = {
  gridRef: RefObject<HTMLDivElement | null>
  /** All rows, in the order shown. */
  orders: Order[]
  /** The rows currently rendered by virtual scrolling. */
  visibleOrders: Order[]
  columns: GridColumn[]
  focusedCell: FocusedCell | null
  firstVisibleRow: number
  pageSize: number
  scrollRowIntoView: (index: number) => void
  onFocusCell: (cell: FocusedCell) => void
  onSort: (column: keyof Order) => void
  onToggleRow: (orderId: string) => void
  onOpenDetails: (orderId: string) => void
  onCloseDetails: () => void
}

/**
 * Keyboard navigation for the grid. The grid element itself keeps the browser's
 * focus (so focus survives rows being removed by virtual scrolling); the focused
 * cell is tracked by order ID and column, shown with a ring, and announced to
 * screen readers through aria-activedescendant.
 */
export function useGridKeyboard(options: GridKeyboardOptions) {
  const { gridRef, orders, visibleOrders, columns, focusedCell, firstVisibleRow, pageSize } = options
  const [hasFocus, setHasFocus] = useState(false)

  function scrollCellIntoView(rowIndex: number, columnIndex: number) {
    const grid = gridRef.current
    if (!grid) return
    if (rowIndex !== HEADER_ROW) options.scrollRowIntoView(rowIndex)
    const column = columns[columnIndex]
    if (column.pinned) return
    // The pinned column covers the left edge, so other columns must be revealed to its right.
    const pinnedWidth = columns[0].pinned ? columns[0].width : 0
    const left = columns.slice(0, columnIndex).reduce((sum, current) => sum + current.width, 0)
    grid.scrollLeft = revealOffset(left - pinnedWidth, column.width, grid.scrollLeft, grid.clientWidth - pinnedWidth)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Keys pressed on something inside the grid (like a header button) are not grid navigation.
    if (event.target !== event.currentTarget) return

    const columnIndex = Math.max(
      0,
      columns.findIndex((column) => column.id === focusedCell?.column),
    )
    let rowIndex = HEADER_ROW
    if (focusedCell?.orderId) {
      // If the focused order is no longer shown, carry on from the first row.
      rowIndex = Math.max(
        0,
        orders.findIndex((order) => order.id === focusedCell.orderId),
      )
    }
    const order = rowIndex === HEADER_ROW ? undefined : orders[rowIndex]

    if (event.key === 'Escape') {
      options.onCloseDetails()
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      // When a filter hides every row, focus is on a row that doesn't exist and the keys do nothing.
      if (rowIndex === HEADER_ROW) {
        options.onSort(columns[columnIndex].id)
      } else if (order && event.key === ' ') {
        options.onToggleRow(order.id)
      } else if (order) {
        options.onOpenDetails(order.id)
      }
      return
    }

    const ctrlKey = event.ctrlKey || event.metaKey
    const next = nextCellPosition(
      { rowIndex, columnIndex },
      event.key,
      ctrlKey,
      orders.length,
      columns.length,
      pageSize,
    )
    if (!next) return
    // Arrow and Page keys would otherwise also scroll the grid by themselves.
    event.preventDefault()
    const nextOrder = next.rowIndex === HEADER_ROW ? undefined : orders[next.rowIndex]
    options.onFocusCell({ orderId: nextOrder ? nextOrder.id : null, column: columns[next.columnIndex].id })
    scrollCellIntoView(next.rowIndex, next.columnIndex)
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    setHasFocus(true)
    // Tabbing into the grid for the first time starts on the first visible row.
    if (event.target === event.currentTarget && !focusedCell) {
      const firstOrder = orders[firstVisibleRow]
      options.onFocusCell({ orderId: firstOrder ? firstOrder.id : null, column: columns[0].id })
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget
    if (!(next instanceof Node && event.currentTarget.contains(next))) setHasFocus(false)
  }

  // The id of the focused cell when it is on screen; screen readers announce it as the active cell.
  let activeCellId: string | undefined
  if (focusedCell?.orderId === null) {
    activeCellId = headerCellId(focusedCell.column)
  } else if (focusedCell && visibleOrders.some((order) => order.id === focusedCell.orderId)) {
    activeCellId = cellId(focusedCell.orderId, focusedCell.column)
  }

  return { hasFocus, activeCellId, handleKeyDown, handleFocus, handleBlur }
}
