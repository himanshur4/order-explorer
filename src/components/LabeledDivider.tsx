type LabeledDividerProps = {
  label: string
}

/** A thin line with a word in the middle, like "or" between two conditions. */
function LabeledDivider({ label }: LabeledDividerProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

export default LabeledDivider
