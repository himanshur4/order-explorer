import { useEffect, useState } from 'react'
import type { Order } from '../types/order'
import type { LoaderMessage } from '../workers/loadOrders.worker'

export type OrdersState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; orders: Order[] }

/** Loads and cleans orders.json in a Web Worker. `retry` starts a fresh load. */
export function useOrders() {
  const [state, setState] = useState<OrdersState>({ status: 'loading' })
  // Changing `attempt` re-runs the effect below, which starts a new worker.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Vite only bundles the worker when the URL is written inline like this.
    const worker = new Worker(new URL('../workers/loadOrders.worker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = (event: MessageEvent<LoaderMessage>) => {
      const message = event.data
      if (message.type === 'ready') {
        setState({ status: 'ready', orders: message.orders })
      } else {
        setState({ status: 'error', message: message.message })
      }
      worker.terminate()
    }

    worker.onerror = () => {
      setState({ status: 'error', message: 'The data loader could not start.' })
      worker.terminate()
    }

    // Stop the worker if the page unmounts or retries before it finishes.
    return () => worker.terminate()
  }, [attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((count) => count + 1)
  }

  return { state, retry }
}
