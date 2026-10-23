import { SlidersHorizontal } from 'lucide-react'
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
  pinnedColumn: keyof Order | null
  onPinnedColumnChange: (column: keyof Order | null) => void
}

// Must be rendered inside <Sheet> (see App): the Filters button opens the small-screen panel.
function Toolbar({ shownCount, totalCount, pinnedColumn, onPinnedColumnChange }: ToolbarProps) {
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
        <p>
          <span className="font-medium tabular-nums">{shownCount.toLocaleString('en-IN')}</span> of{' '}
          <span className="tabular-nums">{totalCount.toLocaleString('en-IN')}</span> orders
        </p>
      )}
      <div className="ml-auto flex items-center gap-2">
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
  )
}

export default Toolbar
