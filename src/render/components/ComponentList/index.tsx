import style from "./ComponentList.module.css";
import { DROP_GROUPS } from "@/components/App";
import { Gate, LogicOperation } from "@/components/circuit-components/Gate";
import { DragTarget } from "@/lib/components/DragNDrop";
import { useConstant } from "@/lib/components/hooks";
import { Lumber } from "@/lib/log/Lumber";
import { createAtom } from "@xstate/store";
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
          ghostElement={() => (
            <Gate
              pos={useConstant(createAtom({ x: 0, y: 0 }))}
              inputs={[undefined, undefined]}
              op={op}
            >
            </Gate>
          )}
        >
          {op.toUpperCase()}
          <Gate
            pos={useConstant(createAtom({ x: 0, y: 0 }))}
            inputs={[undefined, undefined]}
            op={op}
          >
          </Gate>
        </DragTarget>
      ))}
    </div>
  );
});
