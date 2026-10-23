import type { Order } from '../types/order'

/** Row index used for the header row, which sits above row 0. */
export const HEADER_ROW = -1

/** DOM id of a body cell; the grid points screen readers at it with aria-activedescendant. */
export function cellId(orderId: string, column: keyof Order): string {
  return `cell-${orderId}-${column}`
}

/** DOM id of a header cell. */
export function headerCellId(column: keyof Order): string {
  return `header-${column}`
}

export type CellPosition = {
  rowIndex: number
  columnIndex: number
}

/**
 * Where focus moves when a key is pressed, or null if the key doesn't move focus.
 * Arrows move one cell (↑ from the first row reaches the header), PageUp/PageDown
 * move one screen of rows, Home/End go to the first/last column, and with Ctrl
 * they go to the first/last row.
 */
export function nextCellPosition(
  position: CellPosition,
  key: string,
  ctrlKey: boolean,
  rowCount: number,
  columnCount: number,
  pageSize: number,
): CellPosition | null {
  const { rowIndex, columnIndex } = position
  const lastRow = rowCount - 1
  const lastColumn = columnCount - 1

  switch (key) {
    case 'ArrowUp':
      return { rowIndex: Math.max(HEADER_ROW, rowIndex - 1), columnIndex }
    case 'ArrowDown':
      return { rowIndex: Math.min(lastRow, rowIndex + 1), columnIndex }
    case 'ArrowLeft':
      return { rowIndex, columnIndex: Math.max(0, columnIndex - 1) }
    case 'ArrowRight':
      return { rowIndex, columnIndex: Math.min(lastColumn, columnIndex + 1) }
    case 'PageUp':
      return rowIndex === HEADER_ROW ? position : { rowIndex: Math.max(0, rowIndex - pageSize), columnIndex }
    case 'PageDown':
      return { rowIndex: Math.min(lastRow, Math.max(0, rowIndex) + pageSize), columnIndex }
    case 'Home':
      return ctrlKey ? { rowIndex: Math.min(0, lastRow), columnIndex: 0 } : { rowIndex, columnIndex: 0 }
    case 'End':
      return ctrlKey ? { rowIndex: lastRow, columnIndex: lastColumn } : { rowIndex, columnIndex: lastColumn }
    default:
      return null
  }
}

/**
 * The scroll position that brings an item fully into view while scrolling as
 * little as possible. Works the same for rows (vertical) and columns (horizontal).
 */
export function revealOffset(itemStart: number, itemSize: number, scrollPosition: number, viewSize: number): number {
  if (itemStart < scrollPosition) return itemStart
  if (itemStart + itemSize > scrollPosition + viewSize) return itemStart + itemSize - viewSize
  return scrollPosition
}
