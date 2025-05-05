import { useAtom, useControlledState } from "@/lib/components/hooks";
import style from "./Wire.module.css";
import { GridDraggable } from "@/lib/components/GridSurface";
import { Point } from "@/lib/types/Geometry";
import { Fragment, h } from "preact";
import { memo, useCallback, useMemo } from "preact/compat";
import { Lumber } from "@/lib/log/Lumber";
import { Atom, createAtom } from "@xstate/store";
import { GraphNode } from "@/components/circuit-components/GraphNode";
import { useWorkspaceActions } from "@/store/workspace";

type Props = {
  from: Atom<Point>;
  to: Atom<Point>;
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

  const [from, setFrom] = useAtom(props.from);
  const [to, setTo] = useAtom(props.to);

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
        style-wire
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
        style-wire
        onDrag={setTo}
        onDragStop={onToUpdate}
      />
    </>
  );
});

export class WireNode extends GraphNode {
  to: Atom<Point>;

  inputs: [GraphNode.InputPin];
  outputs: [GraphNode.OutputPin];

  constructor(from: Atom<Point>, to: Atom<Point>) {
    super(from);
    this.inputs = [this.createInputPin()];
    this.outputs = [this.createOutputPin()];
    this.pos = this.input.pos = from;
    this.to = this.output.pos = to;
  }

  get input() {
    return this.inputs[0];
  }
  get output() {
    return this.outputs[0];
  }

  flip() {
    //input to output
    //check if input is connected.
    //if input is connected, can not flip

    if (this.input.from || this.output.to) return false;

    const pos = this.pos.get();
    this.pos.set({ ...this.to.get() });
    this.to.set({ ...pos });

    return true;

    //output to input
    // const temp = this.inputs[0]!.pos;
    // this.inputs[0]!.pos = this.outputs[0]!.pos;
  }

  render(): h.JSX.Element {
    const { connectWire, disconnectWire } = useWorkspaceActions();

    const onFromUpdate = useCallback(
      ((pos) => {
        // console.log(this.input.from);
        
        if (this.input.from) disconnectWire({ pin: this.input });
        else connectWire({ wire: this, pin: this.input });
      }) satisfies Wire.Props["onFromUpdate"],
      [],
    );

    const onToUpdate = useCallback(
      ((pos) => {

        // console.log(this.output.to);
        
        if (this.output.to) disconnectWire({ pin: this.output });
        else connectWire({ wire: this, pin: this.output });
      }) satisfies Wire.Props["onToUpdate"],
      [],
    );

    return (
      <Wire
        from={this.pos}
        to={this.to}
        onFromUpdate={onFromUpdate}
        onToUpdate={onToUpdate}
      />
    );
  }
}

export * from "./Joint";
