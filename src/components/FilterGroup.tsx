import { Plus, X } from 'lucide-react'
import { Fragment, useRef } from 'react'
import type { Condition, ConditionGroup } from '../types/filter'
import FilterCondition from './FilterCondition'
import LabeledDivider from './LabeledDivider'
import { Button } from './ui/button'

type FilterGroupProps = {
  group: ConditionGroup
  title: string
  /** The condition that was just added, if it is in this group. */
  newConditionId: string | null
  onAddCondition: (groupId: string) => void
  onRemoveGroup: (groupId: string) => void
  onChangeCondition: (condition: Condition) => void
  onRemoveCondition: (conditionId: string) => void
}

/** A box of conditions combined with OR. */
function FilterGroup({
  group,
  title,
  newConditionId,
  onAddCondition,
  onRemoveGroup,
  onChangeCondition,
  onRemoveCondition,
}: FilterGroupProps) {
  const addButtonRef = useRef<HTMLButtonElement>(null)

  // Focus moves to "Add OR condition" so keyboard users keep their place. Removing
  // the last condition removes the whole group (the builder then moves focus).
  function handleRemoveCondition(conditionId: string) {
    if (group.conditions.length === 1) {
      onRemoveGroup(group.id)
    } else {
      addButtonRef.current?.focus()
      onRemoveCondition(conditionId)
    }
  }

  return (
    <div role="group" aria-label={title} className="flex flex-col gap-2 rounded border bg-background p-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-heading">{title}</h3>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Remove ${title.toLowerCase()}`}
          onClick={() => onRemoveGroup(group.id)}
        >
          <X />
        </Button>
      </div>
      {group.conditions.map((condition, index) => (
        <Fragment key={condition.id}>
          {index > 0 && <LabeledDivider label="or" />}
          <FilterCondition
            condition={condition}
            autoFocus={condition.id === newConditionId}
            onChange={onChangeCondition}
            onRemove={() => handleRemoveCondition(condition.id)}
          />
        </Fragment>
      ))}
      <Button
        ref={addButtonRef}
        variant="ghost"
        size="xs"
        className="self-start"
        onClick={() => onAddCondition(group.id)}
      >
        <Plus />
        Add OR condition
      </Button>
    </div>
  )
}

export default FilterGroup
