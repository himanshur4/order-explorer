import { useEffect, useMemo, useRef, useState } from 'react'
import DetailsPanel from './components/DetailsPanel'
import LoadError from './components/LoadError'
import LoadingState from './components/LoadingState'
import OrdersGrid from './components/OrdersGrid'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import { Sheet } from './components/ui/sheet'
import { useOrders } from './hooks/useOrders'
import { useSelection } from './hooks/useSelection'
import type { FocusedCell } from './types/grid'
import type { Order } from './types/order'
import type { Sort } from './types/sort'
import { DEFAULT_PINNED_COLUMN } from './utils/columns'
import { DEFAULT_SORT, sortOrders, toggleSort } from './utils/sortOrders'

function App() {
  const { state, retry } = useOrders()
  const gridRef = useRef<HTMLDivElement>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT)
  const [pinnedColumn, setPinnedColumn] = useState<keyof Order | null>(DEFAULT_PINNED_COLUMN)
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null)
  // The order shown in the details panel; null while the panel is closed.
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null)
  const orderCount = state.status === 'ready' ? state.orders.length : null

  // Sorting 50,000 orders is expensive, so it only re-runs when the data or the sort changes.
  const sortedOrders = useMemo(() => (state.status === 'ready' ? sortOrders(state.orders, sort) : []), [state, sort])
  const { selectedIds, handleRowClick, clearSelection } = useSelection(sortedOrders)
  const detailsOrder = detailsOrderId === null ? undefined : sortedOrders.find((order) => order.id === detailsOrderId)

  function handleSort(column: keyof Order) {
    setSort((current) => toggleSort(current, column))
  }

  // While the details panel is open, it follows keyboard focus from row to row.
  function handleFocusCell(cell: FocusedCell) {
    setFocusedCell(cell)
    if (detailsOrderId !== null && cell.orderId !== null) setDetailsOrderId(cell.orderId)
  }

  function closeDetails() {
    setDetailsOrderId(null)
    gridRef.current?.focus({ preventScroll: true })
  }

  // The slide-in filters panel only exists below 1024px, so close it if the window grows past that.
  useEffect(() => {
    const wideScreen = window.matchMedia('(min-width: 1024px)')
    function handleChange() {
      if (wideScreen.matches) setFiltersOpen(false)
    }
    wideScreen.addEventListener('change', handleChange)
    return () => wideScreen.removeEventListener('change', handleChange)
  }, [])

  return (
    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
      <div className="flex h-dvh">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Toolbar
            shownCount={orderCount}
            totalCount={orderCount}
            selectedCount={selectedIds.size}
            pinnedColumn={pinnedColumn}
            onClearSelection={clearSelection}
            onPinnedColumnChange={setPinnedColumn}
          />
          <div className="flex h-10 shrink-0 items-center border-b px-4 text-sm text-muted-foreground">
            No filters. Showing all orders.
          </div>
          <div className="min-h-0 flex-1">
            {state.status === 'loading' && <LoadingState />}
            {state.status === 'error' && <LoadError message={state.message} onRetry={retry} />}
            {state.status === 'ready' && (
              <OrdersGrid
                orders={sortedOrders}
                sort={sort}
                pinnedColumn={pinnedColumn}
                selectedIds={selectedIds}
                focusedCell={focusedCell}
                gridRef={gridRef}
                onSort={handleSort}
                onRowClick={handleRowClick}
                onFocusCell={handleFocusCell}
                onOpenDetails={setDetailsOrderId}
                onCloseDetails={closeDetails}
              />
            )}
          </div>
        </main>
        {detailsOrder && (
          <DetailsPanel order={detailsOrder} selected={selectedIds.has(detailsOrder.id)} onClose={closeDetails} />
        )}
      </div>
    </Sheet>
  )
}

export default App
