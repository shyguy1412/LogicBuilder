import { GraphNode } from "@/components/circuit-components/GraphNode";
import style from "./Wire.module.css";
import { GridDraggable } from "@/lib/components/GridSurface";
import { useAtom } from "@/lib/components/hooks";
import { Point } from "@/lib/types/Geometry";
import { Atom } from "@xstate/store";
import { h } from "preact";
import { memo } from "preact/compat";

type Props = {
  pos: Atom<Point>;
};

export namespace Joint {
  export type Props = Parameters<typeof Joint>[0];
}
export const Joint = memo(({ ...props }: Props) => {
  const [pos] = useAtom(props.pos);
  return (
    <GridDraggable
      width={1}
      height={1}
      {...pos}
      class={style.joint}
    />
  );
});

export class JointNode extends GraphNode {
  render(): h.JSX.Element {
    return <Joint pos={this.pos} />;
  }
}
