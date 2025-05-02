import style from "./Workspace.module.css";
import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import { createAtom } from "@xstate/store";
import { Lumber } from "@/lib/log/Lumber";
import { GridSurface } from "@/lib/components/GridSurface";
import { DropTarget } from "@/lib/components/DragNDrop";
import { DROP_GROUPS } from "@/components/App";
import { Gate } from "@/components/circuit-components/Gate";
import { Point } from "@/lib/types/Geometry";

type Props = {};

const calculatePositionOnGrid = (
  ghost: HTMLDivElement,
  grid: HTMLDivElement,
  offset: Point,
) => {
  const ghostRect = ghost.getBoundingClientRect();
  const boundingRect = grid.getBoundingClientRect();
  const em = +getComputedStyle(grid).fontSize.slice(0, -2);

  //If the ghost is a child of the grid we need to compensate for client offset twice
  //once to adjust for the offset of the grid itself and once for the ghost inside the grid
  if (ghost.parentElement == grid) {
    boundingRect.x *= 2;
    boundingRect.y *= 2;
  }

  const posOnGrid = {
    x: Math.round((ghostRect.x - boundingRect.x - offset.x) / em),
    y: Math.round((ghostRect.y - boundingRect.y - offset.y) / em),
  };

  return posOnGrid;
};

const snapGhostIntoGrid = (
  ghost: HTMLDivElement,
  grid: HTMLDivElement,
  offset: Point,
  position: Point,
) => {
  if (ghost.parentElement != grid) grid.append(ghost);
  const em = +getComputedStyle(grid).fontSize.slice(0, -2);
  ghost.setAttribute("data-pos-x", (position.x * em + offset.x) + "");
  ghost.setAttribute("data-pos-y", (position.y * em + offset.y) + "");
};

export function Workspace({}: Props) {
  Lumber.log(Lumber.RENDER, "WORKSPACE RENDER");

  const offset = useMemo(() => createAtom({ x: 0, y: 0 }), []);
  const zoom = useMemo(() => createAtom(1), []);
  const [components, setComponents] = useState<Point[]>([]);

  return (
    <GridSurface
      zoom={zoom.get()}
      offsetX={offset.get().x}
      offsetY={offset.get().y}
      onZoomUpdate={(newZoom) => zoom.set(newZoom)}
      onOffsetUpdate={(newOffset) => offset.set(newOffset)}
    >
      <DropTarget
        class={style.workspace}
        accept={DROP_GROUPS.CIRCUIT_COMPONENT}
        onDragOver={(ev, data, ghost) => {
          if (!ghost) return;

          const positionOnGrid = calculatePositionOnGrid(
            ghost,
            ev.currentTarget,
            offset.get(),
          );

          snapGhostIntoGrid(
            ghost,
            ev.currentTarget,
            offset.get(),
            positionOnGrid,
          );

          console.log(positionOnGrid);

          data.x = positionOnGrid.x;
          data.y = positionOnGrid.y;
        }}
        onDragLeave={(_event, _data, ghost) => document.body.append(ghost!)}
        onDrop={(e, data: any) => {
          Lumber.log("EVENT", `COMPONENT DROPPED AT X:${data.x};Y:${data.y}`);
          setComponents([...components, { ...data } as any]);
        }}
      >
        <Gate x={0} y={0}></Gate>
        {...components.map((pos) => <Gate {...pos}></Gate>)}
      </DropTarget>
    </GridSurface>
  );
}
