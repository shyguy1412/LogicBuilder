import { DROP_GROUPS } from "@/components/App";
import { Gate } from "@/components/circuit-components/Gate";
import { DragTarget } from "@/lib/components/DragNDrop";
import { h } from "preact";
import { memo } from "preact/compat";

export const ComponentList = memo(() => {
  return (
    <DragTarget
      group={DROP_GROUPS.CIRCUIT_COMPONENT}
      data={{}}
      ghostElement={() => <Gate op="and"></Gate>}
    >
      <Gate op="and"></Gate>
    </DragTarget>
  );
});
