import { memo } from 'react'
import type { Order } from '../types/order'
import { COLUMNS } from '../utils/columns'
import StatusLabel from './StatusLabel'

type GridRowProps = {
  order: Order
  rowIndex: number
  top: number
}

function GridRow({ order, rowIndex, top }: GridRowProps) {
  return (
    <div
      role="row"
      aria-rowindex={rowIndex}
      style={{ top }}
      className="absolute left-0 flex h-8 w-full items-center border-b text-sm tabular-nums hover:bg-muted/50"
    >
      {COLUMNS.map((column) => {
        const text = column.format(order)
        return (
          <div
            key={column.id}
            role="gridcell"
            title={column.longText ? text : undefined}
            style={{ width: column.width }}
            className={`shrink-0 truncate px-3 ${column.align === 'right' ? 'text-right' : ''}`}
          >
            {column.id === 'status' ? <StatusLabel status={order.status} /> : text}
          </div>
        )
      })}
    </div>
  )
}

// While scrolling, rows that stay on screen get the same props, so memo skips re-rendering them.
export default memo(GridRow)
