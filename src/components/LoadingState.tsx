import { Spinner } from './ui/spinner'

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Loading orders…
    </div>
  )
}

export default LoadingState
