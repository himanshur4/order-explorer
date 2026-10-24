import { useEffect } from 'react'
import type { ViewState } from '../types/view'
import { writeUrlState } from '../utils/urlState'

// The URL is written once changes pause, because browsers limit how often a page may change it
// (Safari throws an error after 100 changes in 30 seconds).
const WRITE_DELAY_MS = 300

/**
 * Keeps the part of the URL after # in step with the view, so a refresh or a copied link
 * opens the same screen. The link itself is read once, when the page opens (see App).
 */
export function useUrlSync({ filter, sort, pinnedColumn, selectedIds }: ViewState) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Built here, once changes pause, and not while rendering: writing a large selection takes a
      // while, and typing in a filter must not wait for it.
      const hash = writeUrlState({ filter, sort, pinnedColumn, selectedIds })
      // The default view has no # part at all.
      const url = hash === '' ? window.location.pathname + window.location.search : hash
      try {
        window.history.replaceState(null, '', url)
      } catch {
        // If the browser refuses for now, the next change writes the URL again.
      }
    }, WRITE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [filter, sort, pinnedColumn, selectedIds])

  useEffect(() => {
    function handleHashChange() {
      window.location.reload()
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
}
