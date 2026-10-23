import { ArrowDown, ArrowUp, Pin } from 'lucide-react'
import type { Order } from '../types/order'
import type { Sort } from '../types/sort'
import type { GridColumn } from '../utils/columns'
import ResizeHandle from './ResizeHandle'

type GridHeaderProps = {
  columns: GridColumn[]
  sort: Sort
  onSort: (column: keyof Order) => void
  onResize: (column: keyof Order, width: number) => void
  onResetWidth: (column: keyof Order) => void
}

function GridHeader({ columns, sort, onSort, onResize, onResetWidth }: GridHeaderProps) {
  const SortIcon = sort.direction === 'asc' ? ArrowUp : ArrowDown

  return (
    <div role="rowgroup" className="sticky top-0 z-10">
      <div
        role="row"
        aria-rowindex={1}
        className="flex h-8 border-b bg-muted text-xs font-medium text-muted-foreground"
      >
        {columns.map((column) => {
          const isSorted = sort.column === column.id
          return (
            <div
              key={column.id}
              role="columnheader"
              aria-sort={isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
              style={{ width: column.width }}
              className={`shrink-0 ${column.pinned ? 'sticky left-0 z-10 border-r border-input bg-muted' : 'relative'}`}
            >
              <button
                type="button"
                onClick={() => onSort(column.id)}
                className={`flex size-full cursor-pointer items-center gap-1 px-3 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${column.align === 'right' ? 'justify-end' : ''} ${isSorted ? 'text-foreground' : ''}`}
              >
                {column.pinned && <Pin aria-hidden="true" className="size-3 shrink-0" />}
                <span className="truncate">{column.label}</span>
                {column.pinned && <span className="sr-only">(pinned)</span>}
                {isSorted && <SortIcon aria-hidden="true" className="size-3.5 shrink-0" />}
              </button>
              <ResizeHandle
                width={column.width}
                onResize={(width) => onResize(column.id, width)}
                onReset={() => onResetWidth(column.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GridHeader
