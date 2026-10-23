import { X } from 'lucide-react'
import { Button } from './ui/button'

type ChipProps = {
  label: string
  /** The id of the remove button, so focus can be moved to it. */
  removeButtonId: string
  onRemove: () => void
}

/** A small pill for one filter condition, with a button that removes it. Long text is cut short. */
function Chip({ label, removeButtonId, onRemove }: ChipProps) {
  return (
    <span className="inline-flex max-w-72 items-center gap-0.5 rounded bg-accent py-0.5 pr-0.5 pl-2 text-accent-foreground">
      <span title={label} className="truncate">
        {label}
      </span>
      <Button
        id={removeButtonId}
        variant="ghost"
        size="icon-xs"
        aria-label={`Remove filter: ${label}`}
        onClick={onRemove}
      >
        <X />
      </Button>
    </span>
  )
}

export default Chip
