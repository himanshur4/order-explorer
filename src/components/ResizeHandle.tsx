import { type PointerEvent, useRef } from 'react'

const MIN_WIDTH = 60

type ResizeHandleProps = {
  width: number
  onResize: (width: number) => void
  onReset: () => void
}

/** The draggable right edge of a column header. Double-click resets the width. */
function ResizeHandle({ width, onResize, onReset }: ResizeHandleProps) {
  // Where the drag started; null while not dragging.
  const dragStart = useRef<{ x: number; width: number } | null>(null)

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault()
    // Keeps move events coming to this thin handle even when the pointer leaves it.
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { x: event.clientX, width }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return
    onResize(Math.max(MIN_WIDTH, dragStart.current.width + event.clientX - dragStart.current.x))
  }

  function handlePointerUp() {
    dragStart.current = null
  }

  return (
    <div
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={onReset}
      className="absolute inset-y-0 right-0 w-2 cursor-col-resize touch-none hover:bg-primary/30 active:bg-primary/50"
    />
  )
}

export default ResizeHandle
