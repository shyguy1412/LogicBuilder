import style from "./Workspace.module.css";
import { h } from "preact";
import { useCallback, useMemo, useState } from "preact/hooks";
import { Atom, createAtom, createStore } from "@xstate/store";
import { Lumber } from "@/lib/log/Lumber";
import { GridSurface } from "@/lib/components/GridSurface";
import { DropTarget } from "@/lib/components/DragNDrop";
import { DROP_GROUPS } from "@/components/App";
import { Gate, LogicOperation } from "@/components/circuit-components/Gate";
import { Point } from "@/lib/types/Geometry";
import { useSelector } from "@xstate/store/react";
import { Joint, Wire } from "@/components/circuit-components/Wire";

type Props = {};
type GraphNode = any;

const createGateComponent = (x: number, y: number, op: LogicOperation) => {
  const node = {
    type: "gate",
    op,
    pos: createAtom({ x, y }),
    id: new Date(Math.random() * 100_000_000_000_000).toISOString(),
    inputs: [],
    outputs: [],
  } satisfies GraphNode;

  return node;
};

const ComponentStore = createStore({
  context: {
    components: new Map() as Map<string, GraphNode>,
  },
  on: {
    addComponent: (context, event: { component: GraphNode }) => ({
      components: new Map(context.components).set(
        event.component.id,
        event.component,
      ),
    }),
  },
});

ComponentStore.trigger.addComponent({
  component: createGateComponent(0, 0, "and"),
});

export function Workspace({}: Props) {
  Lumber.log(Lumber.RENDER, "WORKSPACE RENDER");

  const offsetStore = useMemo(() => createAtom({ x: 0, y: 0 }), []);
  const offset = offsetStore.get();

  const [zoom, setZoom] = useState(1);

  const components = useSelector(
    ComponentStore,
    ({ context }) => context.components,
  ).values();

  const onDragOver = useCallback(
    ((ev, data, ghost) => {
      if (!ghost) return;
      const offset = offsetStore.get();

      const positionOnGrid = calculatePositionOnGrid(
        ghost,
        ev.currentTarget.firstElementChild!,
        offset,
      );

      snapGhostIntoGrid(
        ghost,
        ev.currentTarget.firstElementChild!,
        offset,
        positionOnGrid,
      );

      data.x = positionOnGrid.x;
      data.y = positionOnGrid.y;
    }) satisfies DropTarget.Props["onDragOver"],
    [offsetStore],
  );

  const onDragLeave = useCallback(
    ((_event, _data, ghost) => {
      if (!ghost) return;
      document.body.append(ghost);
    }) satisfies DropTarget.Props["onDragLeave"],
    [],
  );

  const onDrop = useCallback(
    ((e, data: any) => {
      // Lumber.log("EVENT", `COMPONENT DROPPED AT X:${data.x};Y:${data.y}`, data);

      ComponentStore.trigger.addComponent({
        component: createGateComponent(
          data.x,
          data.y,
          data.op,
        ),
      });
    }) satisfies DropTarget.Props["onDrop"],
    [],
  );

  const joint = createAtom({ x: 9, y: 9 });
  const radius = 5;
  const resolution = 28;

  const wires = Array(resolution).fill(joint.get()).map(({ x, y }, i) => (
    <Wire
      from={joint}
      to={createAtom({
        x: Math.round(x + radius * Math.cos(Math.PI * 2 / resolution * i)),
        y: Math.round(y + radius * Math.sin(Math.PI * 2 / resolution * i)),
      })}
    />
  ));

  return (
    <DropTarget
      class={style.workspace}
      accept={DROP_GROUPS.CIRCUIT_COMPONENT}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <GridSurface
        zoom={zoom}
        minZoom={0.35}
        maxZoom={450}
        zoomSpeed={0.06}
        offsetX={offset.x}
        offsetY={offset.y}
        onOffsetUpdate={(o) => offsetStore.set(o)}
      >
        {...components.map((props) => <Node {...props} />).toArray()}
        <Joint
          pos={joint}
        />
        {...wires}
      </GridSurface>
    </DropTarget>
  );
}

function calculatePositionOnGrid(
  ghost: HTMLDivElement,
  grid: Element,
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
  grid: Element,
  offset: Point,
  position: Point,
) {
  if (ghost.parentElement != grid) grid.append(ghost);
  const em = +getComputedStyle(grid).fontSize.slice(0, -2);
  ghost.setAttribute("data-pos-x", (position.x * em) + "");
  ghost.setAttribute("data-pos-y", (position.y * em) + "");
}

function Node({ type, parent, output, id, ...props }: GraphNode) {
  console.log(props);

  switch (type) {
    case "gate":
      return <Gate {...props} />;
    case "wire":
      return;
    case "joint":
      return;
  }
}
