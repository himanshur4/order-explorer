import { type UIEvent, useLayoutEffect, useRef, useState } from 'react'

// Extra rows rendered above and below the visible area, so fast scrolling never shows a gap.
const OVERSCAN_ROWS = 10

/**
 * Virtual scrolling: works out which rows fall inside the scroll container's
 * visible area, so only those (plus a few extra) need to be rendered.
 * Rows from `start` up to (not including) `end` should be drawn.
 */
export function useVirtualRows(rowCount: number, rowHeight: number) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [firstVisibleRow, setFirstVisibleRow] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Measure the visible height before the first paint, and again whenever the container is resized.
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) return
    const observer = new ResizeObserver(() => setViewportHeight(element.clientHeight))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Storing the top row (not the pixel position) means React only re-renders when a new row scrolls in.
  function handleScroll(event: UIEvent<HTMLDivElement>) {
    setFirstVisibleRow(Math.floor(event.currentTarget.scrollTop / rowHeight))
  }

  const visibleRowCount = Math.ceil(viewportHeight / rowHeight)
  const start = Math.max(0, firstVisibleRow - OVERSCAN_ROWS)
  const end = Math.min(rowCount, firstVisibleRow + visibleRowCount + OVERSCAN_ROWS)

  return { scrollRef, handleScroll, start, end, totalHeight: rowCount * rowHeight }
}
