import style from "./Workspace.module.css";
import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import { createAtom, createStore } from "@xstate/store";
import { Lumber } from "@/lib/log/Lumber";
import { GridSurface } from "@/lib/components/GridSurface";
import { DropTarget } from "@/lib/components/DragNDrop";
import { DROP_GROUPS } from "@/components/App";
import { Gate, LogicOperation } from "@/components/circuit-components/Gate";
import { Point } from "@/lib/types/Geometry";
import { useSelector } from "@xstate/store/react";

type Props = {};

interface ICircuitComponent {
  id: string;
  pos: Point;
  type: string;
}

interface IGateComponent extends ICircuitComponent {
  type: "gate";
  op: LogicOperation;
}

const createGateComponent = (x: number, y: number, op: LogicOperation) => ({
  type: "gate",
  op,
  pos: { x, y },
  id: Date(),
} satisfies IGateComponent);

const ComponentStore = createStore({
  context: {
    components: [createGateComponent(0, 0, "and")] as ICircuitComponent[],
  },
  on: {
    addComponent: (context, event: { component: ICircuitComponent }) => ({
      components: [...context.components, event.component],
    }),
    moveComponent: (context, event: { id: string; pos: Point }) => {
      const componentIndex = context.components.findIndex((el) =>
        el.id == event.id
      );
      if (componentIndex < 0) throw new Error("Invalid ID");
      const component = context.components[componentIndex];

      component.pos = event.pos;
      return {
        components: [
          ...context.components.filter((c) => c.id != event.id),
          component,
        ],
      };
    },
  },
});

export function Workspace({}: Props) {
  Lumber.log(Lumber.RENDER, "WORKSPACE RENDER");

  const offsetStore = useMemo(() => createAtom({ x: 0, y: 0 }), []);
  const offset = offsetStore.get();

  const [zoom, setZoom] = useState(1);

  const components = useSelector(
    ComponentStore,
    ({ context }) => context.components,
  );

  return (
    <GridSurface
      zoom={zoom}
      minZoom={0.35}
      maxZoom={600}
      zoomSpeed={0.06}
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
          ComponentStore.trigger.addComponent({
            component: createGateComponent(
              data.x,
              data.y,
              Object.values(
                LogicOperation,
              )[Date.now() % Object.keys(LogicOperation).length],
            ),
          });
        }}
      >
        {...components.map(({ id, pos, op }) => (
          <Gate
            key={id}
            {...pos}
            op={op}
            onDragStart={(pos) =>
              ComponentStore.trigger.moveComponent({ id, pos })}
            onDragStop={(pos) =>
              ComponentStore.trigger.moveComponent({ id, pos })}
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
