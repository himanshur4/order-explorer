import { type RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useGridKeyboard } from '../hooks/useGridKeyboard'
import { useVirtualRows } from '../hooks/useVirtualRows'
import type { FocusedCell } from '../types/grid'
import type { Order } from '../types/order'
import type { Sort } from '../types/sort'
import { arrangeColumns, type ColumnWidths } from '../utils/columns'
import GridHeader from './GridHeader'
import GridRow from './GridRow'

// Matches the h-8 (32px) row height in GridRow.
const ROW_HEIGHT = 32

type OrdersGridProps = {
  orders: Order[]
  sort: Sort
  pinnedColumn: keyof Order | null
  selectedIds: Set<string>
  focusedCell: FocusedCell | null
  gridRef: RefObject<HTMLDivElement | null>
  onSort: (column: keyof Order) => void
  onRowClick: (orderId: string, shiftKey: boolean) => void
  onFocusCell: (cell: FocusedCell) => void
  onOpenDetails: (orderId: string) => void
  onCloseDetails: () => void
}

function OrdersGrid({
  orders,
  sort,
  pinnedColumn,
  selectedIds,
  focusedCell,
  gridRef,
  onSort,
  onRowClick,
  onFocusCell,
  onOpenDetails,
  onCloseDetails,
}: OrdersGridProps) {
  const virtual = useVirtualRows(gridRef, orders.length, ROW_HEIGHT)
  const [widths, setWidths] = useState<ColumnWidths>({})
  // Memoized so every row gets the same columns object while scrolling, which lets GridRow's memo skip them.
  const columns = useMemo(() => arrangeColumns(pinnedColumn, widths), [pinnedColumn, widths])
  const totalWidth = columns.reduce((sum, column) => sum + column.width, 0)
  const visibleOrders = orders.slice(virtual.start, virtual.end)

  // New rows (after a sort or a filter change) are read from the top. A layout effect runs before
  // the browser paints, so the new rows are never drawn at the old scroll position, which could be
  // past the end of a shorter list.
  const { scrollToTop } = virtual
  useLayoutEffect(() => {
    scrollToTop()
  }, [orders, scrollToTop])

  // Focus goes to the sorted column's header (the effect above scrolls back to the top).
  function handleSort(column: keyof Order) {
    onSort(column)
    onFocusCell({ orderId: null, column })
    gridRef.current?.focus({ preventScroll: true })
  }

  const keyboard = useGridKeyboard({
    gridRef,
    orders,
    visibleOrders,
    columns,
    focusedCell,
    firstVisibleRow: virtual.firstVisibleRow,
    pageSize: virtual.pageSize,
    scrollRowIntoView: virtual.scrollRowIntoView,
    onFocusCell,
    onSort: handleSort,
    onToggleRow: (orderId) => onRowClick(orderId, false),
    onOpenDetails,
    onCloseDetails,
  })

  // Focus the grid once the orders have loaded, so the keyboard works straight away.
  useEffect(() => {
    gridRef.current?.focus({ preventScroll: true })
  }, [gridRef])

  // Kept stable while scrolling (its inputs only change on clicks and key presses), so GridRow's memo still works.
  const handleCellClick = useCallback(
    (orderId: string, column: keyof Order, shiftKey: boolean) => {
      onRowClick(orderId, shiftKey)
      onFocusCell({ orderId, column })
      gridRef.current?.focus({ preventScroll: true })
    },
    [onRowClick, onFocusCell, gridRef],
  )

  function handleResize(column: keyof Order, width: number) {
    setWidths((current) => ({ ...current, [column]: width }))
  }

  function handleResetWidth(column: keyof Order) {
    setWidths((current) => {
      const next = { ...current }
      delete next[column]
      return next
    })
  }

  // The focused cell's ring replaces the grid's own outline; if that cell is scrolled away, the grid shows one.
  const outlineClass =
    keyboard.hasFocus && !keyboard.activeCellId ? 'outline-2 -outline-offset-2 outline-primary' : 'outline-none'

  return (
    <div
      ref={gridRef}
      tabIndex={0}
      role="grid"
      aria-label="Orders"
      aria-multiselectable="true"
      aria-rowcount={orders.length + 1}
      aria-colcount={columns.length}
      aria-activedescendant={keyboard.activeCellId}
      onScroll={virtual.handleScroll}
      onKeyDown={keyboard.handleKeyDown}
      onFocus={keyboard.handleFocus}
      onBlur={keyboard.handleBlur}
      className={`h-full overflow-auto ${outlineClass}`}
    >
      <div role="presentation" className="min-w-full" style={{ width: totalWidth }}>
        <GridHeader
          columns={columns}
          sort={sort}
          focusedColumn={keyboard.hasFocus && focusedCell?.orderId === null ? focusedCell.column : null}
          onSort={handleSort}
          onResize={handleResize}
          onResetWidth={handleResetWidth}
        />
        <div role="rowgroup" className="relative" style={{ height: virtual.totalHeight }}>
          {visibleOrders.map((order, offset) => {
            const index = virtual.start + offset
            return (
              <GridRow
                key={order.id}
                order={order}
                columns={columns}
                rowIndex={index + 2}
                top={index * ROW_HEIGHT}
                selected={selectedIds.has(order.id)}
                focusedColumn={keyboard.hasFocus && focusedCell?.orderId === order.id ? focusedCell.column : null}
                onCellClick={handleCellClick}
                onOpenDetails={onOpenDetails}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OrdersGrid
