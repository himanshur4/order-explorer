import { DATE_OPERATORS, NUMBER_OPERATORS, TEXT_OPERATORS, type Condition } from '../types/filter'
import type { Sort } from '../types/sort'
import type { ViewState } from '../types/view'
import { COLUMNS, DEFAULT_PINNED_COLUMN } from './columns'
import { createCondition, createId } from './editFilter'
import { FIELD_OPTIONS, FILTER_FIELDS } from './filterFields'
import { istDayStart, parseNumber } from './filterOrders'
import { DEFAULT_SORT } from './sortOrders'

// More than the file holds. It stops a hand-made range like 1-9999999 from building millions of IDs.
const MAX_SELECTED = 100_000
const ORDER_ID = /^ORD-(\d{7})$/
const SELECTION_ITEM = /^(\d{1,7})(?:-(\d{1,7}))?$/
// What a number input can hold, so a link can't fill one with text it would never show.
const NUMBER_TEXT = /^-?(\d+|\d*\.\d+)([eE][-+]?\d+)?$/

/**
 * Reads the view from the part of the URL after #. If any of it can't be read,
 * the default view is returned with `broken` set, so the app can say so.
 */
export function readUrlState(hash: string): { view: ViewState; broken: boolean } {
  const view = parseHash(hash)
  return view ? { view, broken: false } : { view: defaultView(), broken: true }
}

/**
 * Writes the view as the part of the URL after #, for example
 * "#group=status:anyOf:shipped,delivered;priority:anyOf:1&sort=amount:desc&selected=2001-7000".
 * Each group is one "group=" (groups are combined with AND); ";" separates the OR conditions
 * inside a group. The default view gives "" (no # part).
 */
export function writeUrlState({ filter, sort, pinnedColumn, selectedIds }: ViewState): string {
  const parts = filter.map((group) => 'group=' + group.conditions.map(writeCondition).join(';'))
  if (sort.column !== DEFAULT_SORT.column || sort.direction !== DEFAULT_SORT.direction) {
    parts.push(`sort=${sort.column}:${sort.direction}`)
  }
  if (pinnedColumn !== DEFAULT_PINNED_COLUMN) parts.push(`pin=${pinnedColumn ?? 'none'}`)
  if (selectedIds.size > 0) parts.push(`selected=${writeSelection(selectedIds)}`)
  return parts.length === 0 ? '' : '#' + parts.join('&')
}

function defaultView(): ViewState {
  return { filter: [], sort: DEFAULT_SORT, pinnedColumn: DEFAULT_PINNED_COLUMN, selectedIds: new Set() }
}

// Strict on purpose: anything the app would not write itself makes the whole link unreadable.
function parseHash(hash: string): ViewState | null {
  const view = defaultView()
  if (hash === '' || hash === '#') return view

  const seenKeys = new Set<string>()
  for (const part of hash.slice(1).split('&')) {
    const separator = part.indexOf('=')
    if (separator === -1) return null
    const key = part.slice(0, separator)
    const value = part.slice(separator + 1)
    // Only "group" may appear more than once.
    if (key !== 'group' && seenKeys.has(key)) return null
    seenKeys.add(key)

    if (key === 'group') {
      const conditions = value.split(';').map(readCondition)
      const readable = conditions.filter((condition) => condition !== null)
      if (readable.length !== conditions.length) return null
      view.filter.push({ id: createId(), conditions: readable })
    } else if (key === 'sort') {
      const sort = readSort(value)
      if (!sort) return null
      view.sort = sort
    } else if (key === 'pin') {
      const column = COLUMNS.find((item) => item.id === value)?.id
      if (value !== 'none' && !column) return null
      view.pinnedColumn = column ?? null
    } else if (key === 'selected') {
      const ids = readSelection(value)
      if (!ids) return null
      view.selectedIds = ids
    } else {
      return null
    }
  }
  return view
}

function readSort(text: string): Sort | null {
  const [columnText, direction, ...rest] = text.split(':')
  const column = COLUMNS.find((item) => item.id === columnText)?.id
  if (!column || rest.length > 0 || (direction !== 'asc' && direction !== 'desc')) return null
  return { column, direction }
}

// A condition is field:operator:values, with values separated by commas. Each value is
// percent-encoded, so commas, colons and the other separators inside typed text can't break it.
function writeCondition(condition: Condition): string {
  const write = (operator: string, values: string[]) =>
    `${condition.field}:${operator}:${values.map(encodeURIComponent).join(',')}`
  switch (condition.kind) {
    case 'text':
      return write(condition.operator, [condition.value])
    case 'number':
    case 'date':
      return write(
        condition.operator,
        condition.operator === 'between' ? [condition.value, condition.valueTo] : [condition.value],
      )
    case 'option':
      return write('anyOf', condition.values)
  }
}

function readCondition(text: string): Condition | null {
  const parts = text.split(':')
  if (parts.length !== 3) return null
  const [fieldText, operator, valuesText] = parts
  const field = FILTER_FIELDS.find((item) => item.field === fieldText)?.field
  const values = readValues(valuesText)
  if (!field || !values) return null

  // Values that aren't filled in yet ('') are kept, so a half-built condition survives a refresh.
  const condition = createCondition(field)
  switch (condition.kind) {
    case 'text': {
      const textOperator = TEXT_OPERATORS.find((item) => item === operator)
      if (!textOperator || values.length !== 1) return null
      return { ...condition, operator: textOperator, value: values[0] }
    }
    case 'number': {
      const numberOperator = NUMBER_OPERATORS.find((item) => item === operator)
      if (!numberOperator || values.length !== (numberOperator === 'between' ? 2 : 1)) return null
      const readable = values.every((value) => value === '' || (NUMBER_TEXT.test(value) && parseNumber(value) !== null))
      if (!readable) return null
      return { ...condition, operator: numberOperator, value: values[0], valueTo: values[1] ?? '' }
    }
    case 'date': {
      const dateOperator = DATE_OPERATORS.find((item) => item === operator)
      if (!dateOperator || values.length !== (dateOperator === 'between' ? 2 : 1)) return null
      if (!values.every((value) => value === '' || istDayStart(value) !== null)) return null
      return { ...condition, operator: dateOperator, value: values[0], valueTo: values[1] ?? '' }
    }
    case 'option': {
      const options = FIELD_OPTIONS[condition.field].map((option) => option.value)
      const picked = valuesText === '' ? [] : values
      if (operator !== 'anyOf' || !picked.every((value) => options.includes(value))) return null
      return { ...condition, values: options.filter((value) => picked.includes(value)) }
    }
  }
}

// decodeURIComponent throws on a broken "%" code, which makes the link unreadable.
function readValues(text: string): string[] | null {
  try {
    return text.split(',').map(decodeURIComponent)
  } catch {
    return null
  }
}

function writeSelection(ids: Set<string>): string {
  // Every order ID in the file is "ORD-" and 7 digits, so the number alone is enough.
  const numbers = [...ids]
    .map((id) => ORDER_ID.exec(id))
    .filter((match) => match !== null)
    .map((match) => Number(match[1]))
    .sort((a, b) => a - b)

  // Runs of neighbouring numbers are written as one range, e.g. 2001-7000.
  const parts: string[] = []
  let start = 0
  while (start < numbers.length) {
    let end = start
    while (end + 1 < numbers.length && numbers[end + 1] === numbers[end] + 1) end++
    parts.push(end > start ? `${numbers[start]}-${numbers[end]}` : String(numbers[start]))
    start = end + 1
  }
  return parts.join(',')
}

function readSelection(text: string): Set<string> | null {
  const ids = new Set<string>()
  for (const item of text.split(',')) {
    const match = SELECTION_ITEM.exec(item)
    if (!match) return null
    const first = Number(match[1])
    const last = match[2] === undefined ? first : Number(match[2])
    if (first < 1 || last < first || ids.size + (last - first + 1) > MAX_SELECTED) return null
    for (let number = first; number <= last; number++) ids.add(`ORD-${String(number).padStart(7, '0')}`)
  }
  return ids
}
