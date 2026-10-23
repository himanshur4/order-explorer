import SidebarContent from './SidebarContent'
import { SheetContent, SheetDescription, SheetTitle } from './ui/sheet'

// From 1024px wide the sidebar is a fixed column; below that it is hidden and the
// same content opens in a slide-in panel. Must be rendered inside <Sheet> (see App).
function Sidebar() {
  return (
    <>
      <aside className="hidden w-80 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <SidebarContent />
      </aside>
      <SheetContent side="left" className="gap-0 bg-sidebar p-0">
        <SheetTitle className="sr-only">Filters</SheetTitle>
        <SheetDescription className="sr-only">Choose which orders the grid shows.</SheetDescription>
        <SidebarContent />
      </SheetContent>
    </>
  )
}

export default Sidebar
