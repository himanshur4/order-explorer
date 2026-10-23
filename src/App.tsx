import { useEffect, useMemo, useState } from 'react'
import LoadError from './components/LoadError'
import LoadingState from './components/LoadingState'
import OrdersGrid from './components/OrdersGrid'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import { Sheet } from './components/ui/sheet'
import { useOrders } from './hooks/useOrders'
import type { Order } from './types/order'
import type { Sort } from './types/sort'
import { DEFAULT_PINNED_COLUMN } from './utils/columns'
import { DEFAULT_SORT, sortOrders, toggleSort } from './utils/sortOrders'

function App() {
  const { state, retry } = useOrders()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT)
  const [pinnedColumn, setPinnedColumn] = useState<keyof Order | null>(DEFAULT_PINNED_COLUMN)
  const orderCount = state.status === 'ready' ? state.orders.length : null

  // Sorting 50,000 orders is expensive, so it only re-runs when the data or the sort changes.
  const sortedOrders = useMemo(() => (state.status === 'ready' ? sortOrders(state.orders, sort) : []), [state, sort])

  function handleSort(column: keyof Order) {
    setSort((current) => toggleSort(current, column))
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
            pinnedColumn={pinnedColumn}
            onPinnedColumnChange={setPinnedColumn}
          />
          <div className="flex h-10 shrink-0 items-center border-b px-4 text-sm text-muted-foreground">
            No filters. Showing all orders.
          </div>
          <div className="min-h-0 flex-1">
            {state.status === 'loading' && <LoadingState />}
            {state.status === 'error' && <LoadError message={state.message} onRetry={retry} />}
            {state.status === 'ready' && (
              <OrdersGrid orders={sortedOrders} sort={sort} pinnedColumn={pinnedColumn} onSort={handleSort} />
            )}
          </div>
        </main>
      </div>
    </Sheet>
  )
}

export default App
