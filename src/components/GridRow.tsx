import { memo, type MouseEvent } from 'react'
import type { Order } from '../types/order'
import type { GridColumn } from '../utils/columns'
import StatusLabel from './StatusLabel'

type GridRowProps = {
  order: Order
  columns: GridColumn[]
  rowIndex: number
  top: number
  selected: boolean
  onRowClick: (orderId: string, shiftKey: boolean) => void
}

function GridRow({ order, columns, rowIndex, top, selected, onRowClick }: GridRowProps) {
  // Shift+click would otherwise also highlight the text between the two rows.
  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.shiftKey) event.preventDefault()
  }

  return (
    <div
      role="row"
      aria-rowindex={rowIndex}
      aria-selected={selected}
      style={{ top }}
      onMouseDown={handleMouseDown}
      onClick={(event) => onRowClick(order.id, event.shiftKey)}
      className={`absolute left-0 flex h-8 w-full border-b text-sm tabular-nums ${selected ? 'bg-accent' : 'bg-background hover:bg-muted'}`}
    >
      {columns.map((column) => {
        const text = column.format(order)
        const pinnedClass = column.pinned ? 'sticky left-0 border-r border-input bg-inherit' : ''
        return (
          <div
            key={column.id}
            role="gridcell"
            title={column.longText ? text : undefined}
            style={{ width: column.width }}
            className={`flex shrink-0 items-center px-3 ${column.align === 'right' ? 'justify-end' : ''} ${pinnedClass}`}
          >
            {column.id === 'status' ? <StatusLabel status={order.status} /> : <span className="truncate">{text}</span>}
          </div>
        )
      })}
    </div>
  )
}

// While scrolling, rows that stay on screen get the same props, so memo skips re-rendering them.
export default memo(GridRow)
