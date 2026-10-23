type ToolbarProps = {
  shownCount: number | null
  totalCount: number | null
}

function Toolbar({ shownCount, totalCount }: ToolbarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center border-b px-4 text-sm">
      {shownCount !== null && totalCount !== null && (
        <p>
          <span className="font-medium tabular-nums">{shownCount.toLocaleString('en-IN')}</span> of{' '}
          <span className="tabular-nums">{totalCount.toLocaleString('en-IN')}</span> orders
        </p>
      )}
    </div>
  )
}

export default Toolbar
