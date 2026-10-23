import { SlidersHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import { SheetTrigger } from './ui/sheet'

type ToolbarProps = {
  shownCount: number | null
  totalCount: number | null
}

// Must be rendered inside <Sheet> (see App): the Filters button opens the small-screen panel.
function Toolbar({ shownCount, totalCount }: ToolbarProps) {
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
    </div>
  )
}

export default Toolbar
