import { useEffect } from 'react'

/**
 * Ctrl+A (⌘A on a Mac) anywhere on the page selects every shown row, or unselects them when all
 * are selected. Inside a text box it keeps its usual job of selecting the text being edited.
 */
export function useSelectAllShortcut(onToggleAll: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCtrlA =
        (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'a'
      if (!isCtrlA || isTextBox(event.target)) return
      // Without this the browser would highlight all the text on the page.
      event.preventDefault()
      // Holding the keys repeats the event; only the first press toggles.
      if (!event.repeat) onToggleAll()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggleAll])
}

function isTextBox(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || target.matches('input, textarea, select'))
}
