import { useVirtualRows } from '../hooks/useVirtualRows'
import type { Order } from '../types/order'
import { COLUMNS } from '../utils/columns'
import GridHeader from './GridHeader'
import GridRow from './GridRow'

const TOTAL_WIDTH = COLUMNS.reduce((sum, column) => sum + column.width, 0)
// Matches the h-8 (32px) row height in GridRow.
const ROW_HEIGHT = 32

type OrdersGridProps = {
  orders: Order[]
}

function OrdersGrid({ orders }: OrdersGridProps) {
  const { scrollRef, handleScroll, start, end, totalHeight } = useVirtualRows(orders.length, ROW_HEIGHT)
  const visibleOrders = orders.slice(start, end)

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      role="grid"
      aria-label="Orders"
      aria-rowcount={orders.length + 1}
      aria-colcount={COLUMNS.length}
      className="h-full overflow-auto"
    >
      <div role="presentation" className="min-w-full" style={{ width: TOTAL_WIDTH }}>
        <GridHeader />
        {/* As tall as every row together, so the scrollbar matches 50,000 rows; only the visible ones are drawn. */}
        <div role="rowgroup" className="relative" style={{ height: totalHeight }}>
          {visibleOrders.map((order, offset) => {
            const index = start + offset
            return <GridRow key={order.id} order={order} rowIndex={index + 2} top={index * ROW_HEIGHT} />
          })}
        </div>
      </div>
    </div>
  )
}

export default OrdersGrid
