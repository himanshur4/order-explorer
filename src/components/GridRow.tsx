import type { Order } from "../types/order";
import { COLUMNS } from "../utils/columns";
import StatusLabel from "./StatusLabel";

type GridRowProps = {
  order: Order;
  rowIndex: number;
};

function GridRow({ order, rowIndex }: GridRowProps) {
  return (
    <div
      role="row"
      aria-rowindex={rowIndex}
      className="flex h-8 items-center border-b text-sm tabular-nums hover:bg-muted/50"
    >
      {COLUMNS.map((column) => {
        const text = column.format(order);
        return (
          <div
            key={column.id}
            role="gridcell"
            title={column.longText ? text : undefined}
            style={{ width: column.width }}
            className={`shrink-0 truncate px-3 ${column.align === "right" ? "text-right" : ""}`}
          >
            {column.id === "status" ? (
              <StatusLabel status={order.status} />
            ) : (
              text
            )}
          </div>
        );
      })}
    </div>
  );
}

export default GridRow;
