import type { Order } from '../types/order'
import { COLUMNS } from '../utils/columns'
import GridHeader from './GridHeader'
import GridRow from './GridRow'

const TOTAL_WIDTH = COLUMNS.reduce((sum, column) => sum + column.width, 0)

// Rendering all 50,000 rows at once would create about 650,000 elements, so this first version shows only the first 100. Virtual scrolling replaces this next.
const STATIC_ROW_LIMIT = 100

type OrdersGridProps = {
  orders: Order[]
}

function OrdersGrid({ orders }: OrdersGridProps) {
  const rows = orders.slice(0, STATIC_ROW_LIMIT)

  return (
    <div
      role="grid"
      aria-label="Orders"
      aria-rowcount={rows.length + 1}
      aria-colcount={COLUMNS.length}
      className="h-full overflow-auto"
    >
      <div role="presentation" className="min-w-full" style={{ width: TOTAL_WIDTH }}>
        <GridHeader />
        <div role="rowgroup">
          {rows.map((order, index) => (
            <GridRow key={order.id} order={order} rowIndex={index + 2} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrdersGrid
