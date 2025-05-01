import style from "./Workspace.module.css";
import { h } from "preact";
import { useMemo } from "preact/hooks";
import { createAtom } from "@xstate/store";
import { Lumber } from "@/lib/log/Lumber";
import { GridDraggable, GridSurface } from "@/lib/components/GridSurface";
import { DropTarget } from "@/lib/components/DragNDrop";
import { DROP_GROUPS } from "@/components/App";

type Props = {};

export function Workspace({}: Props) {
  Lumber.log(Lumber.RENDER, "WORKSPACE RENDER");

  const pos = useMemo(() => createAtom({ x: 0, y: 0 }), []);
  const offset = useMemo(() => createAtom({ x: 0, y: 0 }), []);
  const zoom = useMemo(() => createAtom(1), []);

  return (
    <DropTarget
      class={style.workspace}
      accept={DROP_GROUPS.CIRCUIT_COMPONENT}
      onDrop={(e) => {
        console.log(e.dataTransfer?.getData?.("data"));
      }}
    >
      <GridSurface
        zoom={zoom.get()}
        offsetX={offset.get().x}
        offsetY={offset.get().y}
        onZoomUpdate={(newZoom) => zoom.set(newZoom)}
        // onOffsetUpdate={(newOffset) => offset.set(newOffset)}
      >
        <GridDraggable
          width={3}
          height={5}
          {...pos.get()}
          onPosUpdate={(newPos) => pos.set(newPos)}
        >
          <div style={{ background: "red", width: "100%", height: "100%" }}>
          </div>
        </GridDraggable>
      </GridSurface>
    </DropTarget>
  );
}
