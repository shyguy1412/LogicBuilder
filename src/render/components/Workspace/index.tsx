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
        onDragOver={(ev, ghost) => {
          if (!ghost) return;

          ev.currentTarget.append(ghost);

          const currentOffset = offset.get();
          const ghostPos = ghost.getBoundingClientRect();
          const boundingRect = ev.currentTarget.getBoundingClientRect();
          const em = +getComputedStyle(ev.currentTarget).fontSize.slice(0, -2);

          const origin = {
            x: currentOffset.x + boundingRect.x,
            y: currentOffset.y + boundingRect.y,
          };

          const elementPos = {
            x: ((Math.round((ghostPos.x - origin.x) / em) * em) +
              currentOffset.x),
            y: ((Math.round((ghostPos.y - origin.y) / em) * em) +
              currentOffset.y),
          };

          const posOnGrid = {
            x: Math.round(
              (ghostPos.x - boundingRect.x * 2 - currentOffset.x) / em,
            ),
            y: Math.round(
              (ghostPos.y - boundingRect.y * 2 - currentOffset.y) / em,
            ),
          };

          ghost.setAttribute(
            "data-pos-x",
            (posOnGrid.x * em) + currentOffset.x + "",
          );
          ghost.setAttribute(
            "data-pos-y",
            (posOnGrid.y * em) + currentOffset.y + "",
          );
        }}
        onDragLeave={(_, ghost) => document.body.append(ghost!)}
        onDrop={(e, data) => {
          console.log(data);
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
      </DropTarget>
    </GridSurface>
  );
}
