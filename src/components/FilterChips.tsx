import { Fragment } from 'react'
import type { Filter } from '../types/filter'
import { describeCondition } from '../utils/describeCondition'
import { isConditionComplete } from '../utils/filterOrders'
import Chip from './Chip'
import { Button } from './ui/button'

type FilterChipsProps = {
  filter: Filter
  onRemoveCondition: (conditionId: string) => void
  onClearAll: () => void
}

function removeButtonId(conditionId: string) {
  return `remove-chip-${conditionId}`
}

/** The bar above the grid: one chip per filled-in condition, grouped like the filter, and "Clear all". */
function FilterChips({ filter, onRemoveCondition, onClearAll }: FilterChipsProps) {
  // A condition that isn't filled in yet doesn't filter anything, so it gets no chip.
  const groups = filter
    .map((group) => ({ id: group.id, conditions: group.conditions.filter(isConditionComplete) }))
    .filter((group) => group.conditions.length > 0)
  const chipIds = groups.flatMap((group) => group.conditions.map((condition) => condition.id))

  // The removed chip's button disappears, so focus moves to the next chip (or the one before).
  // When no chip is left, App moves focus to the grid.
  function handleRemove(conditionId: string) {
    const index = chipIds.indexOf(conditionId)
    const neighbourId = chipIds[index + 1] ?? chipIds[index - 1]
    if (neighbourId) document.getElementById(removeButtonId(neighbourId))?.focus()
    onRemoveCondition(conditionId)
  }

  return (
    <div
      role="group"
      aria-label="Active filters"
      className="flex min-h-10 shrink-0 flex-wrap items-center gap-2 border-b px-4 py-1.5 text-xs"
    >
      {groups.length === 0 && <p className="text-sm text-muted-foreground">No filters. Showing all orders.</p>}
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 && <span className="text-muted-foreground">and</span>}
          {/* The chips of one group are combined with OR, so they share a dashed outline. */}
          <div
            className={`flex flex-wrap items-center gap-1 ${group.conditions.length > 1 ? 'rounded border border-dashed border-input p-0.5' : ''}`}
          >
            {group.conditions.map((condition, conditionIndex) => (
              <Fragment key={condition.id}>
                {conditionIndex > 0 && <span className="text-muted-foreground">or</span>}
                <Chip
                  label={describeCondition(condition)}
                  removeButtonId={removeButtonId(condition.id)}
                  onRemove={() => handleRemove(condition.id)}
                />
              </Fragment>
            ))}
          </div>
        </Fragment>
      ))}
      {groups.length > 0 && (
        <Button variant="ghost" size="xs" onClick={onClearAll}>
          Clear all
        </Button>
      )}
    </div>
  )
}

export default FilterChips
