import { useId } from 'react'
import type { Filter } from '../types/filter'
import FilterBuilder from './FilterBuilder'
import { Kbd } from './ui/kbd'

const SHORTCUTS: [keys: string, action: string][] = [
  ['←↑↓→', 'move'],
  ['Space', 'select row'],
  ['Shift', '+ click: range'],
  ['Enter', 'details'],
  ['Esc', 'close details'],
]

type SidebarContentProps = {
  filter: Filter
  onFilterChange: (filter: Filter) => void
}

function SidebarContent({ filter, onFilterChange }: SidebarContentProps) {
  // This content is rendered both in the sidebar and in the small-screen panel, so ids must be unique.
  const filtersHeadingId = useId()

  return (
    <>
      <h1 className="flex h-12 shrink-0 items-center border-b px-4 font-heading text-base font-semibold text-heading">
        Orders Explorer
      </h1>
      <section aria-labelledby={filtersHeadingId} className="flex-1 overflow-y-auto p-4">
        <h2 id={filtersHeadingId} className="text-xs font-semibold tracking-wide text-heading uppercase">
          Filters
        </h2>
        <FilterBuilder filter={filter} onChange={onFilterChange} />
      </section>
      <section aria-label="Keyboard shortcuts" className="shrink-0 border-t p-4">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-muted-foreground">
          {SHORTCUTS.map(([keys, action]) => (
            <li key={keys} className="flex items-center gap-1.5">
              <Kbd className="bg-background">{keys}</Kbd>
              {action}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default SidebarContent
