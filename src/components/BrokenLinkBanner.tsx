import { TriangleAlert, X } from 'lucide-react'
import { Button } from './ui/button'

type BrokenLinkBannerProps = {
  onDismiss: () => void
}

/** Tells the user that the link couldn't be read, so the default view is shown instead. */
function BrokenLinkBanner({ onDismiss }: BrokenLinkBannerProps) {
  return (
    <div
      role="alert"
      className="flex shrink-0 items-center gap-2 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
      <p className="flex-1">This link had settings we couldn't read, so the default view is shown.</p>
      <Button variant="ghost" size="icon-xs" aria-label="Dismiss" onClick={onDismiss}>
        <X />
      </Button>
    </div>
  )
}

export default BrokenLinkBanner
