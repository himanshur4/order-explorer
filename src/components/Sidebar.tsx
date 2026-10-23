function Sidebar() {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-r bg-sidebar">
      <h1 className="flex h-12 shrink-0 items-center border-b px-4 font-heading text-base font-semibold text-heading">
        Orders Explorer
      </h1>
      <section aria-labelledby="filters-heading" className="flex-1 overflow-y-auto p-4">
        <h2 id="filters-heading" className="text-xs font-semibold tracking-wide text-heading uppercase">
          Filters
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">No filters yet.</p>
      </section>
    </aside>
  )
}

export default Sidebar
