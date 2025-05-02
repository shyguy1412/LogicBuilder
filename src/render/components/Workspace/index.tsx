import style from "./Workspace.module.css";
import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
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
  const [components, setComponents] = useState<{ x: number; y: number }[]>([]);

  return (
    <GridSurface
      zoom={zoom.get()}
      offsetX={offset.get().x}
      offsetY={offset.get().y}
      onZoomUpdate={(newZoom) => zoom.set(newZoom)}
      onOffsetUpdate={(
        newOffset,
      ) => offset.set(newOffset)}
    >
      <DropTarget
        class={style.workspace}
        accept={DROP_GROUPS.CIRCUIT_COMPONENT}
        onDragOver={(ev, data, ghost) => {
          if (!ghost) return;

          ev.currentTarget.append(ghost);

          const currentOffset = offset.get();
          const ghostRect = ghost.getBoundingClientRect();
          const boundingRect = ev.currentTarget.getBoundingClientRect();
          const em = +getComputedStyle(ev.currentTarget).fontSize.slice(0, -2);

          const ghostPos = {
            x: ghostRect.x - boundingRect.x * 2,
            y: ghostRect.y - boundingRect.y * 2,
          };

          const posOnGrid = {
            x: Math.round((ghostPos.x - currentOffset.x) / em),
            y: Math.round((ghostPos.y - currentOffset.y) / em),
          };

          ghost.setAttribute(
            "data-pos-x",
            (posOnGrid.x * em) + (currentOffset.x) + "",
          );
          ghost.setAttribute(
            "data-pos-y",
            (posOnGrid.y * em) + (currentOffset.y) + "",
          );
          Object.assign(data as any, { ...posOnGrid });
        }}
        onDragLeave={(_event, _data, ghost) => document.body.append(ghost!)}
        onDrop={(e, data: any) => {
          Lumber.log("EVENT", `COMPONENT DROPPED AT X:${data.x};Y:${data.y}`);
          setComponents([...components, {...data} as any]);
        }}
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
        {...components.map((pos) => (
          <GridDraggable
            {...pos}
            width={3}
            height={5}
          >
            <div style={{ background: "red", width: "100%", height: "100%" }}>
            </div>
          </GridDraggable>
        ))}
      </DropTarget>
    </GridSurface>
  );
}
