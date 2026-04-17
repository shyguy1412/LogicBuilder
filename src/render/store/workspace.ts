import { Point } from '@/lib/types/Geometry';
import { Chip } from '@/render/components/CircuitComponents/Chip';
import { Atom, createAtom } from '@xstate/store';
import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store-react';

const testGraph: Chip.Props[] = [];

// for (let i = 0; i < 500; i++) {
//     let x = 4 * i % 100;
//     let y = Math.floor(4 * i / 100) * 7;

//     testGraph.push({
//         pos: createAtom({ x, y }),
//         width: 3,
//         height: 5,
//         inputs: 4,
//         outputs: 1,
//     });
// }

const WorkspaceStore = createStore({
    context: {
        // componentGraph: testGraph,
        chips: [
            {
                pos: createAtom({ x: 2, y: 1 }),
                width: 3,
                height: 5,
                inputs: 4,
                outputs: 1,
                connections: [[0, [1, 1]]],
            },
            {
                pos: createAtom({ x: 7, y: 4 }),
                width: 3,
                height: 4,
                inputs: 2,
                outputs: 1,
                connections: [],
            },
        ] satisfies Omit<Chip.Props, 'id'>[],
    },
    on: {
        // addNode(context, event: { node: any }) {
        //     return {
        //         componentGraph: new Set(context.componentGraph).add(
        //             event.node,
        //         ),
        //     };
        // },
    },
});

export const useChips = () => useSelector(WorkspaceStore, (store) => store.context.chips);

export const useChip = (chip: number) =>
    useSelector(WorkspaceStore, (store) => store.context.chips[chip]);
