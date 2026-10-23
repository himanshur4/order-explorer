import { Button } from './ui/button'

type LoadErrorProps = {
  message: string
  onRetry: () => void
}

function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div role="alert" className="flex flex-col items-start gap-2 text-sm">
        <p className="font-medium text-destructive">Couldn't load orders</p>
        <p className="text-muted-foreground">{message}</p>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  )
}

export default LoadError
