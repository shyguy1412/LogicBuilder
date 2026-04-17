import style from './Chip.module.css';
import { GridDraggable } from '@/render/components/GridSurface';
import { useAtom } from '@/lib/hooks';
import { Lumber } from '@/lib/log/Lumber';
import { Point } from '@/lib/types/Geometry';
import { h } from 'preact';
import { memo, useEffect, useMemo } from 'preact/compat';
import { Pin } from '@/render/components/CircuitComponents/Pin';
import { Atom } from '@xstate/store';
import { Wire } from '@/render/components/CircuitComponents/Wire';

// export const LogicOperation = {
//     NOT: 'not',
//     AND: 'and',
//     NAND: 'nand',
//     OR: 'or',
//     NOR: 'nor',
//     XOR: 'xor',
//     XNOR: 'xnor',
// } as const;
// export type LogicOperation = typeof LogicOperation[keyof typeof LogicOperation];

/**
 * If the last char is a `!` the gate will draw a not indicator at the output pin
 */
// export const LogicSymbol = {
//     not: '1!',
//     and: '&',
//     nand: '&!',
//     or: '≥1',
//     nor: '≥1!',
//     xor: '=1',
//     xnor: '=1!',
// } satisfies { [op in LogicOperation]: string };

export namespace Chip {
    export type Props = {
        id: number;
        pos: Atom<Point>;
        inputs: number;
        outputs: number;
        width: number;
        height: number;
        connections: [number, [number, number]][];
        // op: LogicOperation;
        // onDragStart?: GridDraggable.Props['onDragStart'];
    };
}

export const Chip = memo(({
    inputs,
    outputs,
    ...props
}: Chip.Props) => {
    Lumber.log(Lumber.RENDER, 'GATE RENDER');

    const [pos, setPos] = useAtom(props.pos);

    const InputPins = () => {
        return <div class={style.inputs}>
            {Array(inputs).fill(0).map((_, i) => {
                return <Pin
                    key={i}
                />;
            })}
        </div>;
    };

    const OutputPins = () => {
        return <div class={style.outputs}>
            {Array(outputs).fill(0).map((_, i) => {
                return <Pin
                    key={i}
                />;
            })}
        </div>;
    };

    const Wires = () => {
        return props.connections.map(([sourcePin, to]) =>
            <Wire from={[props.id, sourcePin]} to={to} />
        );
    };

    return (
        <Lumber.Supress channel={Lumber.RENDER}>
            <Wires></Wires>

            <GridDraggable
                class={style.chip}
                width={props.width}
                height={props.height}
                pos={pos}
                // onDragStart={onDragStart}
                onDrag={setPos}
            >
                <InputPins></InputPins>

                {/* <span class={style.symbol} style-operation-symbol>{symbol}</span> */}
                <OutputPins></OutputPins>
            </GridDraggable>
        </Lumber.Supress>
    );
});
