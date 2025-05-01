import { DROP_GROUPS } from "@/components/App";
import { DragTarget } from "@/lib/components/DragNDrop";
import { h } from "preact";
import { memo } from "preact/compat";

export const ComponentList = memo(() => {
  return (
    <DragTarget
      group={DROP_GROUPS.CIRCUIT_COMPONENT}
      data={{}}
      ghostElement={() => (
        <div style={{ background: "red", width: "3em", height: "5em" }}>
        </div>
      )}
    >
      <div style={{ background: "red", width: "3em", height: "5em" }}>
      </div>
    </DragTarget>
  );
});
