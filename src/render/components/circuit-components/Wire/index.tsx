import { useAtom, useConstant } from '@/lib/hooks';
import style from './Wire.module.css';
import { GridDraggable } from '@/lib/components/GridSurface';
import { Point } from '@/lib/types/Geometry';
import { Fragment, h } from 'preact';
import { memo, useCallback, useMemo } from 'preact/compat';
import { Lumber } from '@/lib/log/Lumber';
import { Atom } from '@xstate/store';

type Props = {
    from: Atom<Point>;
    to: Atom<Point>;
    onFromUpdate?: (from: Point) => void;
    onToUpdate?: (to: Point) => void;
    onDrag?: (to: Point) => void;
};

export namespace Wire {
    export type Props = Parameters<typeof Wire>[0];
}
export const Wire = memo(({
    onFromUpdate,
    onToUpdate,
    ...props
}: Props) => {
    Lumber.log(Lumber.RENDER, 'WIRE RENDER');

    const [from, setFrom] = useAtom(props.from);
    const [to, setTo] = useAtom(props.to);

    const [length, angle] = useMemo(
        () => [
            Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2),
            Math.atan2(to.y - from.y, to.x - from.x),
        ],
        [from, to],
    );

    const onDrag = useCallback(
        ((pos) => {
            const delta = {
                label: 'delta',
                x: from.x - pos.x,
                y: from.y - pos.y,
            };
            setFrom({
                x: from.x - delta.x,
                y: from.y - delta.y,
            });
            setTo({
                x: to.x - delta.x,
                y: to.y - delta.y,
            });
            props.onDrag?.(delta);
        }) satisfies GridDraggable.Props['onDrag'],
        [from, props.onDrag, setFrom, setTo],
    );

    return (
        <>
            <GridDraggable
                width={1}
                height={1}
                pos={from}
                class={style.handle}
                style-wire-from
                style-wire
                onDrag={setFrom}
                onDragStop={onFromUpdate}
            />

            <GridDraggable
                width={0}
                height={0}
                pos={from}
                data-wire-length={length}
                data-wire-angle={angle}
                class={style.wire}
                style-wire
                onDrag={onDrag}
            />

            <GridDraggable
                width={1}
                height={1}
                pos={to}
                class={style.handle}
                style-wire-to
                style-wire
                onDrag={setTo}
                onDragStop={onToUpdate}
            />
        </>
    );
});
