import { X } from 'lucide-react'
import type { Condition } from '../types/filter'
import { changeOperator, createCondition } from '../utils/editFilter'
import { FILTER_FIELDS, OPERATORS, OPERATOR_LABELS } from '../utils/filterFields'
import ConditionValue from './ConditionValue'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

type FilterConditionProps = {
  condition: Condition
  /** True for a condition that was just added, so the keyboard can carry on from its Field select. */
  autoFocus: boolean
  onChange: (condition: Condition) => void
  onRemove: () => void
}

/** One condition: a field, an operator, and the value inputs below them. */
function FilterCondition({ condition, autoFocus, onChange, onRemove }: FilterConditionProps) {
  function handleFieldChange(value: string) {
    const field = FILTER_FIELDS.find((item) => item.field === value)?.field
    // Another field can need another kind of value, so the condition starts again (keeping its id).
    if (field) onChange(createCondition(field, condition.id))
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* The selects are as wide as their text; on a narrow screen the operator wraps to a second line. */}
      <div className="flex flex-wrap items-center gap-1">
        <Select value={condition.field} onValueChange={handleFieldChange}>
          <SelectTrigger size="sm" aria-label="Field" autoFocus={autoFocus} className="max-w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {FILTER_FIELDS.map(({ field, label }) => (
              <SelectItem key={field} value={field}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {condition.kind === 'option' ? (
          // Fixed-value fields have one operator. The box still shows it, so every condition reads the same way.
          <Select value="anyOf" disabled>
            <SelectTrigger size="sm" aria-label="Operator" className="max-w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anyOf">is any of</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Select value={condition.operator} onValueChange={(value) => onChange(changeOperator(condition, value))}>
            <SelectTrigger size="sm" aria-label="Operator" className="max-w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {OPERATORS[condition.kind].map((operator) => (
                <SelectItem key={operator} value={operator}>
                  {OPERATOR_LABELS[operator]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button variant="ghost" size="icon-xs" aria-label="Remove condition" className="ml-auto" onClick={onRemove}>
          <X />
        </Button>
      </div>
      <ConditionValue condition={condition} onChange={onChange} />
    </div>
  )
}

export default FilterCondition
