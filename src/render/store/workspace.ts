import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';
import { AnyComponent, FunctionComponent, VNode } from 'preact';

export const addNode = <
    T extends AnyComponent<any>,
    P extends T extends AnyComponent<infer P> ? P : never,
>(node: [T, P]) => WorkspaceStore.trigger.addNode({ node });

const WorkspaceStore = createStore({
    context: {
        componentGraph: new Set<[AnyComponent, any]>(),
    },
    on: {
        addNode(context, event: { node: [AnyComponent, any] }) {
            return {
                componentGraph: new Set(context.componentGraph).add(
                    event.node,
                ),
            };
        },
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
