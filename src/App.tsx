import LoadError from './components/LoadError'
import LoadingState from './components/LoadingState'
import { useOrders } from './hooks/useOrders'

function App() {
  const { state, retry } = useOrders()

  return (
    <main className="h-screen">
      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && <LoadError message={state.message} onRetry={retry} />}
      {state.status === 'ready' && (
        <p className="flex h-full items-center justify-center text-sm">
          {state.orders.length.toLocaleString('en-IN')} orders loaded
        </p>
      )}
    </main>
  )
}

export default App
