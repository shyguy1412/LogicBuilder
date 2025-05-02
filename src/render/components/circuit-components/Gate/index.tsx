import { DragTarget } from "@/lib/components/DragNDrop";
import { GridDraggable } from "@/lib/components/GridSurface";
import { h } from "preact";

type Props = { x: number; y: number };

export function Gate({ x, y }: Props) {
  return (
    // <DragTarget group="a" data={{}}>
    <GridDraggable
      width={3}
      height={5}
      x={x}
      y={y}
    >
      <div
        style={{
          background: "red",
          width: "100%",
          height: "100%",
          border: "1px solid black",
          boxSizing: "border-box",
        }}
      >
      </div>
    </GridDraggable>
    // </DragTarget>
  );
}
