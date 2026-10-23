import { Check } from 'lucide-react'
import { Fragment } from 'react'
import type { Condition } from '../types/filter'
import { FIELD_OPTIONS } from '../utils/filterFields'
import { Input } from './ui/input'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

type ConditionValueProps = {
  condition: Condition
  onChange: (condition: Condition) => void
}

/** The value part of a condition: text, number or date inputs, or pills for fixed-value fields. */
function ConditionValue({ condition, onChange }: ConditionValueProps) {
  if (condition.kind === 'option') {
    const options = FIELD_OPTIONS[condition.field]
    // Picked values are kept in list order, however they were clicked.
    const handleValuesChange = (values: string[]) =>
      onChange({
        ...condition,
        values: options.map((option) => option.value).filter((value) => values.includes(value)),
      })

    return (
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        spacing={1}
        aria-label="Values"
        value={condition.values}
        onValueChange={handleValuesChange}
        className="flex-wrap"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="text-xs data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-primary"
          >
            {condition.values.includes(option.value) && <Check />}
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    )
  }

  if (condition.kind === 'text') {
    return (
      <Input
        aria-label="Value"
        value={condition.value}
        onChange={(event) => onChange({ ...condition, value: event.target.value })}
        className="h-7 text-xs"
      />
    )
  }

  // Number and date conditions have one input, or two for "between".
  const inputs: { key: 'value' | 'valueTo'; label: string }[] =
    condition.operator === 'between'
      ? [
          { key: 'value', label: 'From' },
          { key: 'valueTo', label: 'To' },
        ]
      : [{ key: 'value', label: 'Value' }]
  const isAmount = condition.field === 'amount'

  return (
    <div className="flex items-center gap-1">
      {inputs.map(({ key, label }, index) => (
        <Fragment key={key}>
          {index > 0 && (
            <span aria-hidden="true" className="text-muted-foreground">
              –
            </span>
          )}
          <div className="relative flex min-w-0 flex-1 items-center">
            {isAmount && (
              <span aria-hidden="true" className="absolute left-2.5 text-xs text-muted-foreground">
                ₹
              </span>
            )}
            <Input
              type={condition.kind === 'date' ? 'date' : 'number'}
              step={condition.kind === 'number' ? 'any' : undefined}
              aria-label={label}
              value={condition[key]}
              onChange={(event) =>
                onChange(
                  key === 'value'
                    ? { ...condition, value: event.target.value }
                    : { ...condition, valueTo: event.target.value },
                )
              }
              className={`h-7 text-xs ${isAmount ? 'pl-6' : ''}`}
            />
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export default ConditionValue
