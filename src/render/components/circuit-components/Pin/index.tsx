import { h } from "preact";
import { memo } from "preact/compat";

type Props = {};

export namespace Pin {
  export type Props = Parameters<typeof Pin>[0];
}
export const Pin = memo(({}: Props) => {
  return <div></div>;
});
