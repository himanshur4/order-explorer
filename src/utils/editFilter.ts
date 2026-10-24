import {
  DATE_OPERATORS,
  NUMBER_OPERATORS,
  TEXT_OPERATORS,
  type Condition,
  type Filter,
  type FilterField,
} from '../types/filter'

// Ids are only used to tell conditions and groups apart while the page is open
// (for example as React keys), so a counter is enough.
let lastId = 0

export function createId(): string {
  lastId += 1
  return String(lastId)
}

/** A condition on `field` with the first operator for its type and no value yet. */
export function createCondition(field: FilterField, id = createId()): Condition {
  switch (field) {
    case 'id':
    case 'customerName':
    case 'customerEmail':
    case 'notes':
      return { id, kind: 'text', field, operator: 'contains', value: '' }
    case 'amount':
    case 'itemCount':
      return { id, kind: 'number', field, operator: 'equals', value: '', valueTo: '' }
    case 'createdAt':
    case 'updatedAt':
      return { id, kind: 'date', field, operator: 'before', value: '', valueTo: '' }
    case 'status':
    case 'region':
    case 'channel':
    case 'paymentMethod':
    case 'priority':
      return { id, kind: 'option', field, values: [] }
  }
}

/** Sets the operator picked in a select. An operator that doesn't fit the condition's type is ignored. */
export function changeOperator(condition: Condition, value: string): Condition {
  switch (condition.kind) {
    case 'text': {
      const operator = TEXT_OPERATORS.find((item) => item === value)
      return operator ? { ...condition, operator } : condition
    }
    case 'number': {
      const operator = NUMBER_OPERATORS.find((item) => item === value)
      return operator ? { ...condition, operator } : condition
    }
    case 'date': {
      const operator = DATE_OPERATORS.find((item) => item === value)
      return operator ? { ...condition, operator } : condition
    }
    case 'option':
      return condition
  }
}

// Each function below returns a new filter and leaves the old one untouched,
// because React only notices a change when it gets a new object.

/** Adds a group (combined with the others by AND) that starts with one condition. */
export function addGroup(filter: Filter, condition: Condition): Filter {
  return [...filter, { id: createId(), conditions: [condition] }]
}

export function removeGroup(filter: Filter, groupId: string): Filter {
  return filter.filter((group) => group.id !== groupId)
}

/** Adds a condition to a group (combined with the group's other conditions by OR). */
export function addCondition(filter: Filter, groupId: string, condition: Condition): Filter {
  return filter.map((group) =>
    group.id === groupId ? { ...group, conditions: [...group.conditions, condition] } : group,
  )
}

/** Puts an edited condition in place of the one with the same id. */
export function replaceCondition(filter: Filter, condition: Condition): Filter {
  return filter.map((group) => ({
    ...group,
    conditions: group.conditions.map((item) => (item.id === condition.id ? condition : item)),
  }))
}

/** Removes a condition, and its group too when it was the group's last condition. */
export function removeCondition(filter: Filter, conditionId: string): Filter {
  return filter
    .map((group) => ({ ...group, conditions: group.conditions.filter((item) => item.id !== conditionId) }))
    .filter((group) => group.conditions.length > 0)
}
