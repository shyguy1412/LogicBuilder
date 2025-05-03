import { GridDraggable } from "@/lib/components/GridSurface";
import style from "./Wire.module.css";
import { Point } from "@/lib/types/Geometry";
import { h } from "preact";
import { memo, useMemo } from "preact/compat";

type Props = {
  from: Point;
  to: Point;
};

export namespace Wire {
  export type Props = Parameters<typeof Wire>[0];
}
export const Wire = memo(({
  from,
  to,
}: Props) => {
  const [length, angle] = useMemo(
    () => [
      Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2),
      Math.atan2(to.y - from.y, to.x - from.x),
    ],
    [from, to],
  );

  console.log(length);

  return (
    <GridDraggable
      width={0}
      height={0}
      x={from.x}
      y={from.y}
    >
      <div
        data-angle={angle}
        data-length={length}
        style-wire=""
        class={style.wire}
      >
      </div>
    </GridDraggable>
  );
});
