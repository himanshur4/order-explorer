import { SlidersHorizontal, X } from 'lucide-react'
import { useId } from 'react'
import type { Order } from '../types/order'
import { COLUMNS } from '../utils/columns'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { SheetTrigger } from './ui/sheet'

// Select values must be strings, so "no pinned column" is stored as this value.
const NO_PIN = 'none'

type ToolbarProps = {
  shownCount: number | null
  totalCount: number | null
  selectedCount: number
  pinnedColumn: keyof Order | null
  onClearSelection: () => void
  onPinnedColumnChange: (column: keyof Order | null) => void
}

// Must be rendered inside <Sheet> (see App): the Filters button opens the small-screen panel.
function Toolbar({
  shownCount,
  totalCount,
  selectedCount,
  pinnedColumn,
  onClearSelection,
  onPinnedColumnChange,
}: ToolbarProps) {
  const pinSelectId = useId()

  function handlePinChange(value: string) {
    onPinnedColumnChange(COLUMNS.find((column) => column.id === value)?.id ?? null)
  }

  return (
    <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2 text-sm">
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal />
          Filters
        </Button>
      </SheetTrigger>
      {shownCount !== null && totalCount !== null && (
        // A status region: screen readers announce the new count after each filter change.
        <p role="status">
          <span className="font-medium tabular-nums">{shownCount.toLocaleString('en-IN')}</span> of{' '}
          <span className="tabular-nums">{totalCount.toLocaleString('en-IN')}</span> orders
        </p>
      )}
      <div className="ml-auto flex items-center gap-4">
        {selectedCount > 0 && (
          <div className="flex items-center gap-1">
            <span className="font-medium text-primary tabular-nums">
              {selectedCount.toLocaleString('en-IN')} selected
            </span>
            <Button variant="ghost" size="icon-xs" aria-label="Clear selection" onClick={onClearSelection}>
              <X />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label htmlFor={pinSelectId} className="text-muted-foreground">
            Pin
          </label>
          <Select value={pinnedColumn ?? NO_PIN} onValueChange={handlePinChange}>
            <SelectTrigger id={pinSelectId} size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              <SelectItem value={NO_PIN}>None</SelectItem>
              {COLUMNS.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  {column.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default Toolbar
