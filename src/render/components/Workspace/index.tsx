import style from "./Workspace.module.css";
import { h } from "preact";
import { useCallback, useMemo, useState } from "preact/hooks";
import { createAtom, createStore } from "@xstate/store";
import { Lumber } from "@/lib/log/Lumber";
import { GridSurface } from "@/lib/components/GridSurface";
import { DropTarget } from "@/lib/components/DragNDrop";
import { DROP_GROUPS } from "@/components/App";
import { Point } from "@/lib/types/Geometry";
import { useSelector } from "@xstate/store/react";
import { JointNode, WireNode } from "@/components/circuit-components/Wire";
import { GraphNode } from "@/components/circuit-components/GraphNode";
import { GateNode } from "@/components/circuit-components/Gate";

// const createGateComponent = (x: number, y: number, op: LogicOperation) => {
//   const node = {
//     type: "gate",
//     op,
//     pos: createAtom({ x, y }),
//     id: new Date(Math.random() * 100_000_000_000_000).toISOString(),
//     inputs: [],
//     outputs: [],
//   } satisfies GraphNode;

//   return node;
// };

// const wireNode = new WireNode();

//! needs a way to find all other points with the same coordinate
const WorkspaceStore = createStore({
  context: {
    pins: new Map<string, Set<GraphNode.Pin>>(),
    componentGraph: new Set<GraphNode>(),
  },
  on: {
    addNode: (context, event: { node: GraphNode }) => ({
      componentGraph: new Set(context.componentGraph).add(
        event.node,
      ),
      pins: event.node.pins().reduce((map, pin) => {
        console.log(pin, event.node);
        const key = stringifyPos(pin.pos);
        const set = map.get(key) ?? new Set();
        set.add(pin);
        return map.set(key, set);
      }, new Map(context.pins)),
    }),
    removeNode: (context, event: { node: GraphNode }) => ({
      componentGraph: (context.componentGraph.delete(
        event.node,
      ),
        new Set(context.componentGraph)),
      pins: event.node.pins().reduce((map, pin) => {
        const key = stringifyPos(pin.pos);
        const set = map.get(key);
        set?.delete(pin);
        return map;
      }, new Map(context.pins)),
    }),
  },
});

WorkspaceStore.subscribe((state) => {
  console.log(
    state.context.componentGraph,
    state.context.pins,
  );
});
WorkspaceStore.trigger.addNode({
  node: new GateNode(createAtom({ x: 0, y: 0 }), "and"),
});

function stringifyPos(obj: {}): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(obj).toSorted(([a], [b]) => a.localeCompare(b)),
    ),
  );
}

console.log(
  new Map()
    .set(
      stringifyPos({ y: 2, x: 1 }),
      "first",
    )
    .set(
      stringifyPos({ x: 1, y: 2 }),
      "first",
    ),
);
const joint = createAtom({ x: 9, y: 9 });
const radius = 5;
const resolution = 28;

WorkspaceStore.trigger.addNode({
  node: new JointNode(joint),
});

Array(resolution).fill(joint.get()).map(({ x, y }, i) =>
  WorkspaceStore.trigger.addNode({
    node: new WireNode(
      joint,
      createAtom({
        x: Math.round(x + radius * Math.cos(Math.PI * 2 / resolution * i)),
        y: Math.round(y + radius * Math.sin(Math.PI * 2 / resolution * i)),
      }),
    ),
  })
);

export function Workspace() {
  Lumber.log(Lumber.RENDER, "WORKSPACE RENDER");

  const offsetStore = useMemo(() => createAtom({ x: 0, y: 0 }), []);
  const offset = offsetStore.get();

  const [zoom, setZoom] = useState(1);

  const components = useSelector(
    WorkspaceStore,
    ({ context }) => context.componentGraph,
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

      WorkspaceStore.trigger.addNode({
        node: new GateNode(
          createAtom({ x: data.x, y: data.y }),
          data.op,
        ),
      });
    }) satisfies DropTarget.Props["onDrop"],
    [],
  );

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
        {...components.map((node) => node.render()).toArray()}
        {
          /* <Joint
          pos={joint}
        />
        {...wires} */
        }
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
