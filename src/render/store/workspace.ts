import { GraphNode } from "@/components/circuit-components/GraphNode";
import { WireNode } from "@/components/circuit-components/Wire";
import { Point } from "@/lib/types/Geometry";
import { createAtom, createStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";

const WorkspaceStore = createStore({
  context: {
    componentGraph: new Set<GraphNode>(),
  },
  on: {
    addNode: (context, event: { node: GraphNode; }) => ({
      componentGraph: new Set(context.componentGraph).add(
        event.node,
      ),
    }),
    removeNode: (context, event: { node: GraphNode; }) => ({
      componentGraph: (context.componentGraph.delete(
        event.node,
      ),
        new Set(context.componentGraph)),
    }),
    lift: ({ componentGraph }, event: { node: GraphNode; }) => ({
      componentGraph:
        (componentGraph.delete(event.node),
          new Set(componentGraph).add(event.node)),
    }),
    connectWire: (
      context,
      event: { wire: WireNode; pin: GraphNode.Pin; },
    ) => {
      const { pin, wire } = event;

      const targetPin = context.componentGraph
        .values()
        .flatMap((node) => node.pins())
        .find((p) =>
          pin != p &&
          p.pos.get().x == pin.pos.get().x &&
          p.pos.get().y == pin.pos.get().y
        );

      if (!targetPin) return console.log("no target", pin.pos.get());
      if (targetPin.type == pin.type && !wire.flip()) {
        return console.log("Failed connection");
      }
      if (targetPin.type == "input") {
        targetPin.from = wire.output;
        wire.output.to = targetPin;
        wire.to = targetPin.pos;
        
        return;
      }

      if (targetPin.type == "output") {
        targetPin.to = wire.input;
        wire.input.from = targetPin;
        wire.pos = targetPin.pos;
        return;
      }

      return console.log("Failed connection");
    },
    disconnectWire: (context, event: { pin: GraphNode.Pin; }) => {
      const target = event.pin.type == "input" ? event.pin.from : event.pin.to;
      if (!target) return;
      target.pos = createAtom({ ...target.pos.get() });
      console.log(target);
      
      if (target.type == "input") {
        target.from = undefined;
      } else {
        target.to = undefined;
      }
      if (event.pin.type == "input") {
        event.pin.from = undefined;
      } else {
        event.pin.to = undefined;
      }
    },
  },
});

function stringifyPos(obj: {}): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(obj).toSorted(([a], [b]) => a.localeCompare(b)),
    ),
  );
}

export const useComponentGraph = () =>
  useSelector(WorkspaceStore, (state) => state.context.componentGraph);
export const useWorkspaceActions = () => WorkspaceStore.trigger;

// export const usePins = () => useSelector(WorkspaceStore, (state) => state.context.componentGraph);

// WorkspaceStore.subscribe((state) => {
//   console.log(
//     state.context.componentGraph,
//   );
// });

// let money = 0;
// let bet = 1;
// let maxBet = bet;

// setInterval(() => {
//   if (Math.random() > 0.5) {
//     money += bet;
//     bet = 1;
//   } else {
//     money -= bet;
//     bet *= 2;
//   }
//   maxBet = Math.max(bet, maxBet);
//   console.log(money, bet, maxBet);

// }, 10);