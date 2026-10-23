import { Plus } from 'lucide-react'
import { Fragment, useRef, useState } from 'react'
import type { Condition, Filter } from '../types/filter'
import {
  addCondition,
  addGroup,
  createCondition,
  removeCondition,
  removeGroup,
  replaceCondition,
} from '../utils/editFilter'
import { DEFAULT_FILTER_FIELD } from '../utils/filterFields'
import FilterGroup from './FilterGroup'
import LabeledDivider from './LabeledDivider'
import { Button } from './ui/button'

type FilterBuilderProps = {
  filter: Filter
  onChange: (filter: Filter) => void
}

/** Edits the filter: groups of conditions, with OR inside a group and AND between groups. */
function FilterBuilder({ filter, onChange }: FilterBuilderProps) {
  // The condition added last. Its Field select takes focus when it appears.
  const [newConditionId, setNewConditionId] = useState<string | null>(null)
  const addGroupButtonRef = useRef<HTMLButtonElement>(null)

  function handleAddGroup() {
    const condition = createCondition(DEFAULT_FILTER_FIELD)
    setNewConditionId(condition.id)
    onChange(addGroup(filter, condition))
  }

  function handleAddCondition(groupId: string) {
    const condition = createCondition(DEFAULT_FILTER_FIELD)
    setNewConditionId(condition.id)
    onChange(addCondition(filter, groupId, condition))
  }

  // The button below the groups is always there, so focus can safely move to it.
  function handleRemoveGroup(groupId: string) {
    addGroupButtonRef.current?.focus()
    onChange(removeGroup(filter, groupId))
  }

  function handleChangeCondition(condition: Condition) {
    onChange(replaceCondition(filter, condition))
  }

  function handleRemoveCondition(conditionId: string) {
    onChange(removeCondition(filter, conditionId))
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {filter.length === 0 && <p className="text-sm text-muted-foreground">No filters yet.</p>}
      {filter.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 && <LabeledDivider label="and" />}
          <FilterGroup
            group={group}
            title={`Group ${index + 1}`}
            newConditionId={newConditionId}
            onAddCondition={handleAddCondition}
            onRemoveGroup={handleRemoveGroup}
            onChangeCondition={handleChangeCondition}
            onRemoveCondition={handleRemoveCondition}
          />
        </Fragment>
      ))}
      <Button
        ref={addGroupButtonRef}
        variant={filter.length === 0 ? 'outline' : 'ghost'}
        size="sm"
        className="self-start"
        onClick={handleAddGroup}
      >
        <Plus />
        {filter.length === 0 ? 'Add filter' : 'Add AND group'}
      </Button>
    </div>
  )
}

export default FilterBuilder
