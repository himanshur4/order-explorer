import { COLUMNS } from '../utils/columns'

function GridHeader() {
  return (
    <div role="rowgroup" className="sticky top-0 z-10">
      <div role="row" aria-rowindex={1} className="flex h-8 border-b bg-muted text-xs font-medium text-muted-foreground">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            role="columnheader"
            style={{ width: column.width }}
            className={`flex shrink-0 items-center px-3 ${column.align === 'right' ? 'justify-end' : ''}`}
          >
            <span className="truncate">{column.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GridHeader
