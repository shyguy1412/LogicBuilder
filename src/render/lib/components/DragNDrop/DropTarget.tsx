import style from "./DragNDrop.module.css";
import { Lumber } from "@/lib/log/Lumber";
import { h } from "preact";
import { HTMLAttributes, memo, useCallback } from "preact/compat";

type Props = {
  accept: string | string[];
} & HTMLAttributes<HTMLDivElement>;

export const DropTarget = memo((
  { accept, onDragEnter, onDragOver, ...attr }: Props,
) => {
  Lumber.log(Lumber.RENDER, "RENDER DROP TARGET");

  const shouldAccept = useCallback((types?: readonly string[]) => {
    if (!types) return false;
    const valid = typeof accept == "string" ? [accept] : accept;
    return valid.some((v) => types.includes(v));
  }, [accept]);

  return (
    <div
      {...attr}
      style-drop-target=""
      class={style.droptarget + " " + (attr.className ?? attr.class ?? "")}
      onDragEnter={(e) => {
        if (shouldAccept(e.dataTransfer?.types)) e.preventDefault();
        if (onDragEnter) onDragEnter(e);
      }}
      onDragOver={(e) => {
        if (shouldAccept(e.dataTransfer?.types)) e.preventDefault();
        if (onDragOver) onDragOver(e);
      }}
    >
    </div>
  );
});
