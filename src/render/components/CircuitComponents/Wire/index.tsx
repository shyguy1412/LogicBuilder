import { useAtom, useConstant } from '@/lib/hooks';
import style from './Wire.module.css';
import { GridDraggable } from '@/render/components/GridSurface';
import { Point } from '@/lib/types/Geometry';
import { Fragment, h } from 'preact';
import { memo, useCallback, useMemo } from 'preact/compat';
import { Lumber } from '@/lib/log/Lumber';
import { Atom } from '@xstate/store';
import { useChip } from '@/render/store/workspace';

type Props = {
    from: [number, number];
    to: [number, number];
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

    const fromChip = useChip(props.from[0]);
    const toChip = useChip(props.to[0]);

    const [fromChipPos] = useAtom(fromChip.pos);
    const [toChipPos] = useAtom(toChip.pos);

    const from = useMemo(
        () => {
            const pinIndex = props.from[1] + 0;
            const pinSpacing = Math.max(1, fromChip.height / fromChip.outputs);
            const topOffset = fromChip.height / 2 -
                pinSpacing * (fromChip.outputs - 1) / 2;

            const fromPinOffset = pinIndex * pinSpacing + topOffset;

            return {
                x: fromChipPos.x + fromChip.width,
                y: fromChipPos.y + fromPinOffset,
            };
        },
        [fromChipPos, props.from[1]],
    );

    const to = useMemo(
        () => {
            const pinIndex = props.to[1] + 0;
            const pinSpacing = Math.max(1, toChip.height / toChip.inputs);
            const topOffset = toChip.height / 2 -
                pinSpacing * (toChip.inputs - 1) / 2;

            const toPinOffset = pinIndex * pinSpacing + topOffset;

            return {
                x: toChipPos.x,
                y: toChipPos.y + toPinOffset,
            };
        },
        [toChipPos, props.to],
    );

    const [length, angle] = useMemo(
        () => [
            Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2),
            Math.atan2(to.y - from.y, to.x - from.x),
        ],
        [from, to],
    );

    return (
        <>
            {
                /* <GridDraggable
                width={1}
                height={1}
                pos={from}
                class={style.handle}
                style-wire-from
                style-wire
                data-pin={props.from[1]}
                // onDrag={setFrom}
                onDragStop={onFromUpdate}
            /> */
            }

            <div
                data-pos-x={from.x}
                data-pos-y={from.y}
                data-wire-length={length}
                data-wire-angle={angle}
                class={style.wire}
                style-wire
                // onDrag={onDrag}
            />
            {
                /*
            <GridDraggable
                width={1}
                height={1}
                pos={to}
                class={style.handle}
                style-wire-to
                style-wire
                data-pin={props.to[1]}
                // onDrag={setTo}
                onDragStop={onToUpdate}
            /> */
            }
        </>
    );
});
