import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';
import { AnyComponent, VNode } from 'preact';

const WorkspaceStore = createStore({
    context: {
        componentGraph: new Set<[AnyComponent, any]>(),
    },
    on: {
        // addNode(context, event: { node: VNode; }) {
        //   return {
        //     componentGraph: new Set(context.componentGraph).add(
        //       event.node,
        //     ),
        //   };
        // },
        //   removeNode: (context, event: { node: GraphNode; }) => ({
        //     componentGraph: (context.componentGraph.delete(
        //       event.node,
        //     ),
        //       new Set(context.componentGraph)),
        //   }),
        //   lift: ({ componentGraph }, event: { node: GraphNode; }) => ({
        //     componentGraph:
        //       (componentGraph.delete(event.node),
        //         new Set(componentGraph).add(event.node)),
        //   }),
    },
});

export const useComponentGraph = () =>
    useSelector(WorkspaceStore, (state) => state.context.componentGraph);
export const useWorkspaceActions = () => WorkspaceStore.trigger;
