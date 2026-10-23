import type { Filter } from '../types/filter'
import SidebarContent from './SidebarContent'
import { SheetContent, SheetDescription, SheetTitle } from './ui/sheet'

type SidebarProps = {
  filter: Filter
  onFilterChange: (filter: Filter) => void
}

// From 1024px wide the sidebar is a fixed column; below that it is hidden and the
// same content opens in a slide-in panel. Must be rendered inside <Sheet> (see App).
function Sidebar({ filter, onFilterChange }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-80 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <SidebarContent filter={filter} onFilterChange={onFilterChange} />
      </aside>
      <SheetContent side="left" className="gap-0 bg-sidebar p-0">
        <SheetTitle className="sr-only">Filters</SheetTitle>
        <SheetDescription className="sr-only">Choose which orders the grid shows.</SheetDescription>
        <SidebarContent filter={filter} onFilterChange={onFilterChange} />
      </SheetContent>
    </>
  )
}

export default Sidebar
