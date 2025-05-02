import style from "./Workspace.module.css";
import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import { createAtom, createStore } from "@xstate/store";
import { Lumber } from "@/lib/log/Lumber";
import { GridSurface } from "@/lib/components/GridSurface";
import { DropTarget } from "@/lib/components/DragNDrop";
import { DROP_GROUPS } from "@/components/App";
import { Gate } from "@/components/circuit-components/Gate";
import { Point } from "@/lib/types/Geometry";
import { useSelector } from "@xstate/store/react";

type Props = {};

const ComponentStore = createStore({
  context: { components: { 0: { x: 0, y: 0 } } as Record<string, Point> },
  on: {
    setComponent: (context, event: { id: string; pos: Point }) => ({
      components: {
        ...context.components,
        [event.id]: event.pos,
      },
    }),
  },
});

export function Workspace({}: Props) {
  Lumber.log(Lumber.RENDER, "WORKSPACE RENDER");

  const offsetStore = useMemo(() => createAtom({ x: 0, y: 0 }), []);
  const offset = offsetStore.get();

  const [zoom, setZoom] = useState(5);

  const componentsMap = useSelector(
    ComponentStore,
    ({ context }) => context.components,
  );

  const components = useMemo(() => Object.entries(componentsMap), [
    componentsMap,
  ]);

  return (
    <GridSurface
      zoom={zoom}
      offsetX={offset.x}
      offsetY={offset.y}
      onOffsetUpdate={(o) => offsetStore.set(o)}
    >
      <DropTarget
        class={style.workspace}
        accept={DROP_GROUPS.CIRCUIT_COMPONENT}
        onDragOver={(ev, data, ghost) => {
          if (!ghost) return;
          const offset = offsetStore.get();

          const positionOnGrid = calculatePositionOnGrid(
            ghost,
            ev.currentTarget,
            offset,
          );

          snapGhostIntoGrid(
            ghost,
            ev.currentTarget,
            offset,
            positionOnGrid,
          );

          data.x = positionOnGrid.x;
          data.y = positionOnGrid.y;
        }}
        onDragLeave={(_event, _data, ghost) => document.body.append(ghost!)}
        onDrop={(e, data: any) => {
          Lumber.log("EVENT", `COMPONENT DROPPED AT X:${data.x};Y:${data.y}`);
          ComponentStore.trigger.setComponent({
            id: Date.now() + "",
            pos: { ...data },
          });
        }}
      >
        {...components.map(([id, pos]) => (
          <Gate
            key={id}
            {...pos}
            onPosUpdate={(pos) =>
              ComponentStore.trigger.setComponent({ id, pos })}
          >
          </Gate>
        ))}
      </DropTarget>
    </GridSurface>
  );
}

function calculatePositionOnGrid(
  ghost: HTMLDivElement,
  grid: HTMLDivElement,
  offset: Point,
) {
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
}

function snapGhostIntoGrid(
  ghost: HTMLDivElement,
  grid: HTMLDivElement,
  offset: Point,
  position: Point,
) {
  if (ghost.parentElement != grid) grid.append(ghost);
  const em = +getComputedStyle(grid).fontSize.slice(0, -2);
  ghost.setAttribute("data-pos-x", (position.x * em) + "");
  ghost.setAttribute("data-pos-y", (position.y * em) + "");
}
