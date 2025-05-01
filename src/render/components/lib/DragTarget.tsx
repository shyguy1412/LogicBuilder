import { h } from "preact";
import { HTMLAttributes } from "preact/compat";

type Props = {
  group: string;
  data: string;
} & HTMLAttributes<HTMLDivElement>;

export function DragTarget({ group, data, onDragStart, ...attr }: Props) {
  return (
    <div
      draggable={true}
      data-drag-group={group}
      data-drag-data={data}
      onDragStart={(e) => {
        e.dataTransfer?.setData(group, e.currentTarget.id);
        e.dataTransfer?.setData("data", data);
        if (onDragStart) onDragStart(e);
      }}
      {...attr}
    >
    </div>
  );
}
