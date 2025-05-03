import style from "./Gate.module.css";
import { GridDraggable } from "@/lib/components/GridSurface";
import { useControlledState } from "@/lib/components/hooks";
import { Lumber } from "@/lib/log/Lumber";
import { Point } from "@/lib/types/Geometry";
import { h } from "preact";
import { memo, useMemo } from "preact/compat";

export const LogicOperation = {
  NOT: "not",
  AND: "and",
  NAND: "nand",
  OR: "or",
  NOR: "nor",
  XOR: "xor",
  XNOR: "xnor",
} as const;
export type LogicOperation = typeof LogicOperation[keyof typeof LogicOperation];

/**
 * If the last char is a `!` the gate will draw a not indicator at the output pin
 */
export const LogicSymbol = {
  not: "1!",
  and: "&",
  nand: "&!",
  or: "≥1",
  nor: "≥1!",
  xor: "=1",
  xnor: "=1!",
} satisfies { [op in LogicOperation]: string };

type Props = {
  x?: number;
  y?: number;
  op: LogicOperation;
  inputs: any[];
  output: any;
  onDragStart?: (pos: Point) => void;
  onDrag?: (pos: Point) => void;
  onDragStop?: (pos: Point) => void;
};
export namespace Gate {
  export type Props = Parameters<typeof Gate>[0];
}

export const Gate = memo(({
  inputs,
  onDragStart,
  onDrag,
  onDragStop,
  ...props
}: Props) => {
  Lumber.log(Lumber.RENDER, "GATE RENDER");

  //this lets a Gate manage it position internally.
  //Position updates from the parent take precedence but dont need to happen
  //for a component to move
  const [{ x, y }, setPos] = useControlledState(
    (x, y) => ({ x: x ?? 0, y: y ?? 0 }),
    [props.x, props.y],
    onDragStop,
  );

  const [symbol, negated] = useMemo(
    () => [
      LogicSymbol[props.op].replace(/!$/, ""),
      LogicSymbol[props.op].endsWith("!"),
    ],
    [props.op],
  );

  return (
    <Lumber.Supress channel={Lumber.RENDER}>
      <GridDraggable
        width={3}
        height={4}
        x={x ?? 0}
        y={y ?? 0}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragStop={setPos}
      >
        <div
          class={style.gate}
          // onMouseDown={(e) => console.log(e.currentTarget)}>
        >
          <div class={style.inputs}>
            {inputs.map(() => <div></div>)}
          </div>
          <span class={style.symbol} style-operation-symbol>{symbol}</span>
          <div style-not={negated ? "" : undefined} class={style.output} />
        </div>
      </GridDraggable>
    </Lumber.Supress>
  );
});
