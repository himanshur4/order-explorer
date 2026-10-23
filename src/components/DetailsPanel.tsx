import { Check, X } from 'lucide-react'
import { Fragment, type KeyboardEvent } from 'react'
import type { Order } from '../types/order'
import {
  CHANNEL_LABELS,
  PAYMENT_METHOD_LABELS,
  REGION_LABELS,
  formatAmount,
  formatDateTime,
  formatPriority,
} from '../utils/format'
import StatusLabel from './StatusLabel'
import { Button } from './ui/button'
import { Kbd } from './ui/kbd'

type DetailsPanelProps = {
  order: Order
  selected: boolean
  onClose: () => void
}

/** Every field of one order. Docked beside the grid from 1024px wide; slides over it on smaller screens. */
function DetailsPanel({ order, selected, onClose }: DetailsPanelProps) {
  const fields: [label: string, value: string][] = [
    ['Customer', order.customerName],
    ['Email', order.customerEmail],
    ['Amount', formatAmount(order.amount)],
    ['Currency', order.currency],
    ['Items', String(order.itemCount)],
    ['Created (IST)', formatDateTime(order.createdAt)],
    ['Updated (IST)', order.updatedAt === null ? '—' : formatDateTime(order.updatedAt)],
    ['Region', REGION_LABELS[order.region]],
    ['Channel', CHANNEL_LABELS[order.channel]],
    ['Payment', PAYMENT_METHOD_LABELS[order.paymentMethod]],
    ['Priority', formatPriority(order.priority)],
  ]

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') onClose()
  }

  return (
    <aside
      aria-label="Order details"
      onKeyDown={handleKeyDown}
      className="fixed inset-y-0 right-0 z-40 flex w-80 max-w-full flex-col border-l bg-sidebar shadow-md lg:static lg:shadow-none"
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <h2 className="font-heading text-sm font-semibold text-heading">Order {order.id}</h2>
        <Button variant="ghost" size="icon-sm" aria-label="Close details" onClick={onClose}>
          <X />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-sm">
        <div className="flex items-center gap-3">
          <StatusLabel status={order.status} />
          {selected && (
            <span className="inline-flex items-center gap-1 text-primary">
              <Check aria-hidden="true" className="size-3.5" />
              Selected
            </span>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          {fields.map(([label, value]) => (
            <Fragment key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="min-w-0 tabular-nums wrap-break-word">{value}</dd>
            </Fragment>
          ))}
        </dl>
        <h3 className="mt-6 text-xs font-semibold tracking-wide text-heading uppercase">Notes</h3>

        <p className="mt-2 whitespace-pre-wrap wrap-break-word">
          {order.notes || <span className="text-muted-foreground">No notes</span>}
        </p>
      </div>
      <p className="flex shrink-0 items-center gap-1.5 border-t px-4 py-3 text-xs text-muted-foreground">
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
        <span className="mr-2">next order</span>
        <Kbd>Esc</Kbd>
        <span>close</span>
      </p>
    </aside>
  )
}

export default DetailsPanel
