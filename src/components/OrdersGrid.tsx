import { useMemo, useState } from 'react'
import { useVirtualRows } from '../hooks/useVirtualRows'
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
  onSort: (column: keyof Order) => void
  onRowClick: (orderId: string, shiftKey: boolean) => void
}

function OrdersGrid({ orders, sort, pinnedColumn, selectedIds, onSort, onRowClick }: OrdersGridProps) {
  const { scrollRef, handleScroll, start, end, totalHeight } = useVirtualRows(orders.length, ROW_HEIGHT)
  // Widths the user dragged; they reset when the page reloads.
  const [widths, setWidths] = useState<ColumnWidths>({})
  // Memoized so every row gets the same columns object while scrolling, which lets GridRow's memo skip them.
  const columns = useMemo(() => arrangeColumns(pinnedColumn, widths), [pinnedColumn, widths])
  const totalWidth = columns.reduce((sum, column) => sum + column.width, 0)
  const visibleOrders = orders.slice(start, end)

  // A new sort starts reading from the top of the list.
  function handleSort(column: keyof Order) {
    scrollRef.current?.scrollTo({ top: 0 })
    onSort(column)
  }

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

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      role="grid"
      aria-label="Orders"
      aria-multiselectable="true"
      aria-rowcount={orders.length + 1}
      aria-colcount={columns.length}
      className="h-full overflow-auto"
    >
      <div role="presentation" className="min-w-full" style={{ width: totalWidth }}>
        <GridHeader
          columns={columns}
          sort={sort}
          onSort={handleSort}
          onResize={handleResize}
          onResetWidth={handleResetWidth}
        />
        
        <div role="rowgroup" className="relative" style={{ height: totalHeight }}>
          {visibleOrders.map((order, offset) => {
            const index = start + offset
            return (
              <GridRow
                key={order.id}
                order={order}
                columns={columns}
                rowIndex={index + 2}
                top={index * ROW_HEIGHT}
                selected={selectedIds.has(order.id)}
                onRowClick={onRowClick}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OrdersGrid
