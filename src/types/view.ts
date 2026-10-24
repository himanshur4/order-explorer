import type { Filter } from './filter'
import type { Order } from './order'
import type { Sort } from './sort'

/** What the URL keeps: the filter, the sort, the pinned column and the selected rows. */
export type ViewState = {
  filter: Filter
  sort: Sort
  pinnedColumn: keyof Order | null
  selectedIds: Set<string>
}
