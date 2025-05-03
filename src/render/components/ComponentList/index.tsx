import style from "./ComponentList.module.css";
import { DROP_GROUPS } from "@/components/App";
import { Gate, LogicOperation } from "@/components/circuit-components/Gate";
import { DragTarget } from "@/lib/components/DragNDrop";
import { useConstant } from "@/lib/components/hooks";
import { Lumber } from "@/lib/log/Lumber";
import { h } from "preact";
import { memo } from "preact/compat";

export const ComponentList = memo(() => {
  Lumber.log(Lumber.RENDER, "COMPONENT LIST RENDER");

  return (
    <div class={style.list}>
      {Object.values(LogicOperation).map((op) => (
        <DragTarget
          key={op}
          group={DROP_GROUPS.CIRCUIT_COMPONENT}
          data={{ op }}
          ghostElement={() => <Gate op={op}></Gate>}
        >
          {op.toUpperCase()}
          <Gate op={op}></Gate>
        </DragTarget>
      ))}
    </div>
  );
});
