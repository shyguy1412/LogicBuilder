import { useControlledState } from "@/lib/components/hooks";
import style from "./Wire.module.css";
import { GridDraggable } from "@/lib/components/GridSurface";
import { Point } from "@/lib/types/Geometry";
import { Fragment, h } from "preact";
import { memo, useCallback, useMemo } from "preact/compat";
import { Lumber } from "@/lib/log/Lumber";

type Props = {
  from: Point;
  to: Point;
  onFromUpdate?: (from: Point) => void;
  onToUpdate?: (to: Point) => void;
};

export namespace Wire {
  export type Props = Parameters<typeof Wire>[0];
}
export const Wire = memo(({
  onFromUpdate,
  onToUpdate,
  ...props
}: Props) => {
  Lumber.log(Lumber.RENDER, "WIRE RENDER");

  const [from, setFrom] = useControlledState(
    (from) => from,
    [props.from],
  );

  const [to, setTo] = useControlledState(
    (to) => to,
    [props.to],
  );

  const [length, angle] = useMemo(
    () => [
      Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2),
      Math.atan2(to.y - from.y, to.x - from.x),
    ],
    [from, to],
  );

  const onDrag = useCallback(
    ((pos) => {
      const delta = {
        label: "delta",
        x: from.x - pos.x,
        y: from.y - pos.y,
      };
      setFrom({
        x: from.x - delta.x,
        y: from.y - delta.y,
      });
      setTo({
        x: to.x - delta.x,
        y: to.y - delta.y,
      });
    }) satisfies GridDraggable.Props["onDrag"],
    [from, to, setFrom, setTo],
  );

  return (
    <>
      <GridDraggable
        width={1}
        height={1}
        x={from.x}
        y={from.y}
        class={style.handle}
        style-wire-from
        onDrag={setFrom}
        onDragStop={onFromUpdate}
      />

      <GridDraggable
        width={0}
        height={0}
        x={from.x}
        y={from.y}
        data-wire-length={length}
        data-wire-angle={angle}
        class={style.wire}
        style-wire
        onDrag={onDrag}
      />

      <GridDraggable
        width={1}
        height={1}
        x={to.x}
        y={to.y}
        class={style.handle}
        style-wire-to
        onDrag={setTo}
        onDragStop={onToUpdate}
      />
    </>
  );
});
