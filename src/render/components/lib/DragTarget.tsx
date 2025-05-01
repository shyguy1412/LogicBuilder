import { Lumber } from "@/components/lib/log/Lumber";
import { h } from "preact";
import { HTMLAttributes, memo } from "preact/compat";

type Props = {
  group: string;
  data: string;
} & HTMLAttributes<HTMLDivElement>;

export const DragTarget = memo(
  ({ group, data, onDragStart, ...attr }: Props) => {
    Lumber.log(Lumber.RENDER, "RENDER DRAG TARGET");
    return (
      <div
        style-drag-target=""
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
  },
);
