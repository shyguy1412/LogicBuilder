import style from './Gate.module.css';
import { GridDraggable } from '@/render/components/GridSurface';
import { useAtom } from '@/lib/hooks';
import { Lumber } from '@/lib/log/Lumber';
import { Point } from '@/lib/types/Geometry';
import { Atom, createAtom } from '@xstate/store';
import { h } from 'preact';
import { memo, useEffect, useMemo } from 'preact/compat';
import { Pin } from '@/render/components/CircuitComponents/Pin';

export const LogicOperation = {
    NOT: 'not',
    AND: 'and',
    NAND: 'nand',
    OR: 'or',
    NOR: 'nor',
    XOR: 'xor',
    XNOR: 'xnor',
} as const;
export type LogicOperation = typeof LogicOperation[keyof typeof LogicOperation];

/**
 * If the last char is a `!` the gate will draw a not indicator at the output pin
 */
export const LogicSymbol = {
    not: '1!',
    and: '&',
    nand: '&!',
    or: '≥1',
    nor: '≥1!',
    xor: '=1',
    xnor: '=1!',
} satisfies { [op in LogicOperation]: string };

type Props = {
    pos: Atom<Point>;
    op: LogicOperation;
    inputs: Atom<Point>[];
    // output: Atom<Point>;
    onDragStart?: GridDraggable.Props['onDragStart'];
};
export namespace Gate {
    export type Props = Parameters<typeof Gate>[0];
}

export const Gate = memo(({
    // inputs,
    // output,
    inputs,
    onDragStart,
    ...props
}: Props) => {
    Lumber.log(Lumber.RENDER, 'GATE RENDER');

    //this lets a Gate manage it position internally.
    //Position updates from the parent take precedence but dont need to happen
    //for a component to move
    const [pos, _setPos] = useAtom(props.pos);
    const setPos = (newPos: Point) =>
        _setPos((oldPos) => {
            const posDelta = {
                x: oldPos.x - newPos.x,
                y: oldPos.y - newPos.y,
            };
            for (const pin of inputs) {
                pin.set((oldPos) => ({
                    x: oldPos.x - posDelta.x,
                    y: oldPos.y - posDelta.y,
                }));
            }
            return newPos;
        });

    const [symbol, negated] = useMemo(
        () => [
            LogicSymbol[props.op].replace(/!$/, ''),
            LogicSymbol[props.op].endsWith('!'),
        ],
        [props.op],
    );

    useEffect(() => {
        for (const [i, pin] of inputs.entries()) {
            pin.set(() => ({
                x: pos.x,
                y: pos.y + i,
            }));
        }
    }, [inputs]);

    const Pins = () => {
        return inputs.map((pinPosAtom, i) => () => {
            const [pinPos] = useAtom(pinPosAtom);

            return <Pin
                // data-snap-to-grid
                data-pos-x={pinPos.x - pos.x}
                data-pos-y={pinPos.y - pos.y + i + 1}
                key={i}
            />;
        }).map((Pin) => <Pin />);
    };

    return (
        <Lumber.Supress channel={Lumber.RENDER}>
            <GridDraggable
                class={style.gate}
                width={3}
                height={4}
                pos={pos}
                onDragStart={onDragStart}
                onDrag={setPos}
            >
                <Pins></Pins>
                <span class={style.symbol} style-operation-symbol>{symbol}</span>
                {/* <Pin style-not={negated ? '' : undefined} class={style.output} /> */}
            </GridDraggable>
        </Lumber.Supress>
    );
});
