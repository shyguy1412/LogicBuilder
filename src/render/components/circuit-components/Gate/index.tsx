import { GridDraggable } from "@/lib/components/GridSurface";
import { useControlledState } from "@/lib/components/hooks";
import { Lumber } from "@/lib/log/Lumber";
import { Point } from "@/lib/types/Geometry";
import { h } from "preact";
import { memo } from "preact/compat";

type Props = {
  x?: number;
  y?: number;
  onPosUpdate?: (pos: Point) => void;
};

export const Gate = memo(({ onPosUpdate, ...props }: Props) => {
  Lumber.log(Lumber.RENDER, "GATE RENDER");

  //this lets a Gate manage it position internally.
  //Position updates from the parent take precedence but dont need to happen
  //for a component to move
  const [{ x, y }, setPos] = useControlledState(
    (x, y) => ({ x: x ?? 0, y: y ?? 0 }),
    [props.x, props.y],
    onPosUpdate,
  );

  return (
    // <DragTarget group="a" data={{}}>
    <GridDraggable
      width={3}
      height={5}
      x={x ?? 0}
      y={y ?? 0}
      // onPosUpdate={setPos}
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
});
