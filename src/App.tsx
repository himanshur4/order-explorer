import LoadError from './components/LoadError'
import LoadingState from './components/LoadingState'
import OrdersGrid from './components/OrdersGrid'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import { useOrders } from './hooks/useOrders'

function App() {
  const { state, retry } = useOrders()
  const orderCount = state.status === 'ready' ? state.orders.length : null

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Toolbar shownCount={orderCount} totalCount={orderCount} />
        <div className="flex h-10 shrink-0 items-center border-b px-4 text-sm text-muted-foreground">
          No filters. Showing all orders.
        </div>
        <div className="min-h-0 flex-1">
          {state.status === 'loading' && <LoadingState />}
          {state.status === 'error' && <LoadError message={state.message} onRetry={retry} />}
          {state.status === 'ready' && <OrdersGrid orders={state.orders} />}
        </div>
      </main>
    </div>
  )
}

export default App
