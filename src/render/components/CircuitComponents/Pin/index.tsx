// import { addNode } from '@/render/store/workspace';
import style from './Pin.module.css';
import { h, HTMLAttributes } from 'preact';
import { memo } from 'preact/compat';
import { Wire } from '@/render/components/CircuitComponents/Wire';

export type Pin = {
    chip: number;
};
export namespace Pin {
    export type Props = {} & HTMLAttributes<HTMLDivElement>;
}
export const Pin = memo(({
    ...props
}: Pin.Props) => {
    return <div
        {...props}
        class={style.pin}
        onClick={() => {
            // addNode([Wire, {
            //     from: props.pos,
            // }]);
        }}
    >
    </div>;
});
