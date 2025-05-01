import { DROP_GROUPS } from "@/components/App";
import { DragTarget } from "@/lib/components/DragTarget";
import { h } from "preact";
import { memo } from "preact/compat";

export const ComponentList = memo(() => {
  return (
    <DragTarget
      group={DROP_GROUPS.CIRCUIT_COMPONENT}
      data={"HELLO WORwLD"}
    >
      Test
    </DragTarget>
  );
});
