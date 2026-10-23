import type { OrderStatus } from '../types/order'
import { STATUS_LABELS } from '../utils/format'

const DOT_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-500',
  processing: 'bg-blue-500',
  shipped: 'bg-violet-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-gray-400',
}

type StatusLabelProps = {
  status: OrderStatus
}

function StatusLabel({ status }: StatusLabelProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${DOT_COLORS[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}

export default StatusLabel
