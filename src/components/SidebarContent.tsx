import { useId } from 'react'

function SidebarContent() {
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
        <p className="mt-2 text-sm text-muted-foreground">No filters yet.</p>
      </section>
    </>
  )
}

export default SidebarContent
