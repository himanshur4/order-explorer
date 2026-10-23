import { Button } from './ui/button'

type NoResultsProps = {
  onClearFilters: () => void
}

/** Shown over the grid's empty body when the filter matches no orders. */
function NoResults({ onClearFilters }: NoResultsProps) {
  // It starts below the 32px header row, so the column names stay visible. Clicks and scrolling
  // pass through to the grid everywhere except on the message itself.
  return (
    <div className="pointer-events-none absolute inset-x-0 top-8 bottom-0 flex items-center justify-center p-4">
      <div className="pointer-events-auto flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium text-heading">No orders match these filters</p>
        <p className="text-sm text-muted-foreground">Remove a filter, or clear them all to see every order.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    </div>
  )
}

export default NoResults
