import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import BrokenLinkBanner from './components/BrokenLinkBanner'
import DetailsPanel from './components/DetailsPanel'
import FilterChips from './components/FilterChips'
import LoadError from './components/LoadError'
import LoadingState from './components/LoadingState'
import NoResults from './components/NoResults'
import OrdersGrid from './components/OrdersGrid'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import { Sheet } from './components/ui/sheet'
import { useOrders } from './hooks/useOrders'
import { useSelection } from './hooks/useSelection'
import { useUrlSync } from './hooks/useUrlSync'
import type { Filter } from './types/filter'
import type { Order } from './types/order'
import type { Sort } from './types/sort'
import { buildCsv, csvFileName } from './utils/buildCsv'
import { downloadFile } from './utils/downloadFile'
import { removeCondition } from './utils/editFilter'
import { filterOrders, isFilterActive } from './utils/filterOrders'
import { sortOrders, toggleSort } from './utils/sortOrders'
import { readUrlState } from './utils/urlState'

function App() {
  const { state, retry } = useOrders()
  const gridRef = useRef<HTMLDivElement>(null)
  // The link is read once, when the page opens, and decides how the screen starts.
  const [link] = useState(() => readUrlState(window.location.hash))
  const [linkBroken, setLinkBroken] = useState(link.broken)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>(link.view.filter)
  const [sort, setSort] = useState<Sort>(link.view.sort)
  const [pinnedColumn, setPinnedColumn] = useState<keyof Order | null>(link.view.pinnedColumn)
  // The order shown in the details panel; null while the panel is closed.
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null)
  const orderCount = state.status === 'ready' ? state.orders.length : null

  // Sorting 50,000 orders is expensive, so it only re-runs when the data or the sort changes.
  const sortedOrders = useMemo(() => (state.status === 'ready' ? sortOrders(state.orders, sort) : []), [state, sort])
  // Updating the grid after a filter change (filtering, then drawing new rows) takes tens of
  // milliseconds. The grid uses this deferred copy of the filter, so React shows each key press in
  // the filter inputs first and updates the grid right after, skipping it while typing continues.
  const deferredFilter = useDeferredValue(filter)
  // Filtering keeps the sorted order, so editing the filter never re-sorts. Memoized because it
  // loops over 50,000 orders, which only needs to happen when the sorted list or the filter changes.
  const shownOrders = useMemo(() => filterOrders(sortedOrders, deferredFilter), [sortedOrders, deferredFilter])
  const { selectedIds, handleRowClick, clearSelection } = useSelection(shownOrders, link.view.selectedIds)
  useUrlSync({ filter, sort, pinnedColumn, selectedIds })
  // The 200-rows rule: a selected row is counted and exported only while the filter shows it.
  // Selected rows the filter hides stay selected and are counted apart. Memoized because both
  // loop over up to 50,000 orders, which only needs to happen when the rows or the selection change.
  const selectedShownOrders = useMemo(
    () => shownOrders.filter((order) => selectedIds.has(order.id)),
    [shownOrders, selectedIds],
  )
  const selectedOrderCount = useMemo(
    () => sortedOrders.filter((order) => selectedIds.has(order.id)).length,
    [sortedOrders, selectedIds],
  )
  // Looked up in all orders, so the panel stays open when a filter hides its order.
  const detailsOrder = detailsOrderId === null ? undefined : sortedOrders.find((order) => order.id === detailsOrderId)

  function handleSort(column: keyof Order) {
    setSort((current) => toggleSort(current, column))
  }

  function handleExport() {
    downloadFile(csvFileName(Date.now()), buildCsv(selectedShownOrders), 'text/csv;charset=utf-8')
  }

  function dismissLinkBanner() {
    setLinkBroken(false)
    gridRef.current?.focus({ preventScroll: true })
  }

  // "Clear all" and "Clear filters" disappear once clicked, so focus moves to the grid.
  function clearFilter() {
    setFilter([])
    gridRef.current?.focus({ preventScroll: true })
  }

  function handleRemoveCondition(conditionId: string) {
    const nextFilter = removeCondition(filter, conditionId)
    setFilter(nextFilter)
    // Without its last chip, the chips bar has no button left to hold focus.
    if (!isFilterActive(nextFilter)) gridRef.current?.focus({ preventScroll: true })
  }

  // While the details panel is open, it follows keyboard focus from row to row.
  function handleFocusRow(orderId: string) {
    if (detailsOrderId !== null) setDetailsOrderId(orderId)
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
        <Sidebar filter={filter} onFilterChange={setFilter} />
        <main className="flex min-w-0 flex-1 flex-col">
          {linkBroken && <BrokenLinkBanner onDismiss={dismissLinkBanner} />}
          <Toolbar
            shownCount={state.status === 'ready' ? shownOrders.length : null}
            totalCount={orderCount}
            selectedCount={selectedShownOrders.length}
            hiddenSelectedCount={selectedOrderCount - selectedShownOrders.length}
            pinnedColumn={pinnedColumn}
            onClearSelection={clearSelection}
            onPinnedColumnChange={setPinnedColumn}
            onExport={handleExport}
          />
          <FilterChips filter={filter} onRemoveCondition={handleRemoveCondition} onClearAll={clearFilter} />
          <div className="relative min-h-0 flex-1">
            {state.status === 'loading' && <LoadingState />}
            {state.status === 'error' && <LoadError message={state.message} onRetry={retry} />}
            {state.status === 'ready' && (
              <OrdersGrid
                orders={shownOrders}
                sort={sort}
                pinnedColumn={pinnedColumn}
                selectedIds={selectedIds}
                gridRef={gridRef}
                onSort={handleSort}
                onRowClick={handleRowClick}
                onFocusRow={handleFocusRow}
                onOpenDetails={setDetailsOrderId}
                onCloseDetails={closeDetails}
              />
            )}
            {state.status === 'ready' && shownOrders.length === 0 && isFilterActive(deferredFilter) && (
              <NoResults onClearFilters={clearFilter} />
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
