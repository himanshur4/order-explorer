import { type RefObject, type UIEvent, useCallback, useLayoutEffect, useState } from 'react'
import { revealOffset } from '../utils/gridNavigation'

// Extra rows rendered above and below the visible area, so fast scrolling never shows a gap.
const OVERSCAN_ROWS = 10

/**
 * Virtual scrolling: works out which rows fall inside the scroll container's
 * visible area, so only those (plus a few extra) need to be rendered.
 * Rows from `start` up to (not including) `end` should be drawn.
 * Assumes a sticky header row of the same height as the rows.
 */
export function useVirtualRows(scrollRef: RefObject<HTMLDivElement | null>, rowCount: number, rowHeight: number) {
  const [firstVisibleRow, setFirstVisibleRow] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Measure the visible height before the first paint, and again whenever the container is resized.
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) return
    const observer = new ResizeObserver(() => setViewportHeight(element.clientHeight))
    observer.observe(element)
    return () => observer.disconnect()
  }, [scrollRef])

  // Storing the top row (not the pixel position) means React only re-renders when a new row scrolls in.
  function handleScroll(event: UIEvent<HTMLDivElement>) {
    setFirstVisibleRow(Math.floor(event.currentTarget.scrollTop / rowHeight))
  }

  // The first row is set together with the scroll position, so the next paint already shows the top rows.
  // useCallback keeps the function the same between renders, so OrdersGrid's effect only runs when the rows change.
  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    setFirstVisibleRow(0)
  }, [scrollRef])

  /** Scrolls just enough to show the row with this index below the sticky header. */
  function scrollRowIntoView(index: number) {
    const element = scrollRef.current
    if (!element) return
    element.scrollTop = revealOffset(index * rowHeight, rowHeight, element.scrollTop, element.clientHeight - rowHeight)
  }

  const visibleRowCount = Math.ceil(viewportHeight / rowHeight)
  const start = Math.max(0, firstVisibleRow - OVERSCAN_ROWS)
  const end = Math.min(rowCount, firstVisibleRow + visibleRowCount + OVERSCAN_ROWS)
  // Rows that fit below the header; PageUp/PageDown move by this much.
  const pageSize = Math.max(1, Math.floor(viewportHeight / rowHeight) - 1)

  return {
    handleScroll,
    scrollToTop,
    scrollRowIntoView,
    start,
    end,
    firstVisibleRow,
    pageSize,
    totalHeight: rowCount * rowHeight,
  }
}
