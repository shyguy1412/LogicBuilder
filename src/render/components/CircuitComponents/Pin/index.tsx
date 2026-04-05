import style from './Pin.module.css';
import { h, HTMLAttributes } from 'preact';
import { memo } from 'preact/compat';

export namespace Pin {
    export type Props = {} & HTMLAttributes<HTMLDivElement>;
}
export const Pin = memo(({
    ...props
}: Pin.Props) => {
    return <div {...props} class={style.pin} onClick={() => console.log('pin clicked')}>
    </div>;
});
