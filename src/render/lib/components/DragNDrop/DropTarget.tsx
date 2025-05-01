import { DragStore } from "@/lib/components/DragNDrop/DragTarget";
import style from "./DragNDrop.module.css";
import { Lumber } from "@/lib/log/Lumber";
import { h } from "preact";
import {
  HTMLAttributes,
  memo,
  TargetedEvent,
  useCallback,
} from "preact/compat";

type Props =
  & {
    accept: string | string[];
    onDrop?: (
      ev: TargetedEvent<HTMLDivElement, DragEvent>,
      data?: unknown,
    ) => void;
    onDragEnter?: (
      ev: TargetedEvent<HTMLDivElement, DragEvent>,
      ghost?: HTMLDivElement,
    ) => void;
    onDragOver?: (
      ev: TargetedEvent<HTMLDivElement, DragEvent>,
      ghost?: HTMLDivElement,
    ) => void;
    onDragLeave?: (
      ev: TargetedEvent<HTMLDivElement, DragEvent>,
      ghost?: HTMLDivElement,
    ) => void;
  }
  & Omit<
    HTMLAttributes<HTMLDivElement>,
    "onDrop" | "onDragOver" | "onDragEnter" | "onDragLeave"
  >;

export const DropTarget = memo((
  { accept, onDragEnter, onDragOver, onDrop, onDragLeave, ...attr }: Props,
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
        const id = +e.dataTransfer?.types.find((t) => t.startsWith("id-"))!
          .slice(3)!;
        const ghost = DragStore.get().context.ghostElements.get(id);
        onDragEnter?.(e, ghost);
      }}
      onDragOver={(e) => {
        if (shouldAccept(e.dataTransfer?.types)) e.preventDefault();
        const id = +e.dataTransfer?.types.find((t) => t.startsWith("id-"))!
          .slice(3)!;
        const ghost = DragStore.get().context.ghostElements.get(id);
        onDragOver?.(e, ghost);
      }}
      onDragLeave={(e) => {
        if (shouldAccept(e.dataTransfer?.types)) e.preventDefault();
        const id = +e.dataTransfer?.types.find((t) => t.startsWith("id-"))!
          .slice(3)!;
        const ghost = DragStore.get().context.ghostElements.get(id);
        onDragLeave?.(e, ghost);
      }}
      onDrop={(e) => {
        const id = +e.dataTransfer?.getData("data-id")!;
        const data = DragStore.get().context.data.get(id);
        onDrop?.(e, data);
      }}
    >
    </div>
  );
});
