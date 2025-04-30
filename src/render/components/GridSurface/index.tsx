import style from "./GirdSurface.module.css";

import { PropsWithChildren } from "preact/compat";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { h } from "preact";

import { Lumber } from "@/components/lib/log/Lumber";
import { createAtom } from "@xstate/store";

type Props = {
  zoom: number;
  onZoomUpdate?: (zoom: number) => void;
  onOffsetUpdate?: (offset: { x: number; y: number }) => void;
  offsetX?: number;
  offsetY?: number;
};

export function GridSurface(
  { children, ...props }: PropsWithChildren<Props>,
) {
  Lumber.log(Lumber.RENDER, "GRID SURFACE RENDER");

  const zoom = useMemo(
    () => {
      return createAtom(props.zoom);
    },
    [props.zoom],
  );

  const offset = useMemo(
    () => {
      return createAtom({ x: props.offsetX ?? 0, y: props.offsetY ?? 0 });
    },
    [props.offsetX, props.offsetY],
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Lumber.log(Lumber.HOOK, "EFFECT - GridDragSurface zoom");
    const { unsubscribe } = zoom.subscribe((zoom) => {
      if (!ref.current) return;
      ref.current.setAttribute("data-zoom", zoom + "");
      props.onZoomUpdate?.(zoom);
    });
    return unsubscribe;
  }, [zoom]);

  useEffect(() => {
    Lumber.log(Lumber.HOOK, "EFFECT - GridDragSurface pos");
    const { unsubscribe } = offset.subscribe(({ x, y }) => {
      if (!ref.current) return;
      ref.current.setAttribute("data-offset-x", x + "");
      ref.current.setAttribute("data-offset-y", y + "");
      props.onOffsetUpdate?.({ x, y });
    });
    return unsubscribe;
  }, [zoom]);

  const move = useCallback(
    (
      startPos: { x: number; y: number },
      startMouse: { x: number; y: number },
    ) =>
    (ev: MouseEvent) => {
      if (!ref.current) return;

      const x = startPos.x - (startMouse.x - ev.clientX);
      const y = startPos.y - (startMouse.y - ev.clientY);

      offset.set({ x, y });
    },
    [offset],
  );

  return (
    <div
      ref={ref}
      style-grid-surface=""
      data-zoom={zoom.get()}
      data-offset-x={offset.get().x}
      data-offset-y={offset.get().y}
      class={style.surface}
      onWheel={(
        { deltaY, currentTarget, currentTarget: { parentElement } },
      ) => {
        const currentZoom =
          +(getComputedStyle(currentTarget).fontSize.slice(0, -2)) /
          +(getComputedStyle(parentElement!).fontSize.slice(0, -2));
        zoom.set(currentZoom - (deltaY / 2000));
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
        const movehandler = move(
          offset.get(),
          {
            x: event.clientX,
            y: event.clientY,
          },
        );
        window.addEventListener("mousemove", movehandler);
        window.addEventListener("mouseup", () => {
          document.body.style.cursor = "";
          window.removeEventListener("mousemove", movehandler);
        }, {
          once: true,
        });
        document.body.style.cursor = "move";
      }}
    >
      {children}
    </div>
  );
}

export { GridDraggable } from "./GridDraggabble";
