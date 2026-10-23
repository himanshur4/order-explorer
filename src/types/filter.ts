export type TextField = 'id' | 'customerName' | 'customerEmail' | 'notes'
export type NumberField = 'amount' | 'itemCount'
export type DateField = 'createdAt' | 'updatedAt'
export type OptionField = 'status' | 'region' | 'channel' | 'paymentMethod' | 'priority'
export type FilterField = TextField | NumberField | DateField | OptionField

export const TEXT_OPERATORS = ['contains', 'notContains', 'equals'] as const
export const NUMBER_OPERATORS = ['equals', 'greaterThan', 'lessThan', 'between'] as const
export const DATE_OPERATORS = ['before', 'after', 'between'] as const

export type TextOperator = (typeof TEXT_OPERATORS)[number]
export type NumberOperator = (typeof NUMBER_OPERATORS)[number]
export type DateOperator = (typeof DATE_OPERATORS)[number]

/** The option value that stands for orders without a priority. */
export const NO_PRIORITY = 'none'

// Values are kept exactly as typed into the inputs (dates as "yyyy-mm-dd"), so a
// half-typed number is never lost. filterOrders reads them.
export type TextCondition = {
  id: string
  kind: 'text'
  field: TextField
  operator: TextOperator
  value: string
}

export type NumberCondition = {
  id: string
  kind: 'number'
  field: NumberField
  operator: NumberOperator
  value: string
  /** The second number, used only by "between". */
  valueTo: string
}

export type DateCondition = {
  id: string
  kind: 'date'
  field: DateField
  operator: DateOperator
  value: string
  /** The second day, used only by "between". */
  valueTo: string
}

/** Matches orders whose value is any of `values` (priority uses '1' to '3' and NO_PRIORITY). */
export type OptionCondition = {
  id: string
  kind: 'option'
  field: OptionField
  values: string[]
}

export type Condition = TextCondition | NumberCondition | DateCondition | OptionCondition

/** Conditions in a group are combined with OR. */
export type ConditionGroup = {
  id: string
  conditions: Condition[]
}

/** Groups are combined with AND. An empty filter shows every order. */
export type Filter = ConditionGroup[]
