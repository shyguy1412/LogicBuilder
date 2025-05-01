import style from "./GirdSurface.module.css";

import { PropsWithChildren, TargetedEvent } from "preact/compat";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { h } from "preact";

import { Lumber } from "@/components/lib/log/Lumber";
import { createAtom } from "@xstate/store";

type Point = { x: number; y: number };

type Props = {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomUpdate?: (zoom: number) => void;
  onOffsetUpdate?: (offset: Point) => void;
  offsetX?: number;
  offsetY?: number;
};

export function GridSurface(
  { children, minZoom, maxZoom, ...props }: PropsWithChildren<Props>,
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
      startPos: Point,
      startMouse: Point,
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
      data-min-zoom={minZoom}
      data-max-zoom={maxZoom}
      data-offset-x={offset.get().x}
      data-offset-y={offset.get().y}
      class={style.surface}
      onWheel={(event) => {
        const { currentTarget, deltaY, clientX, clientY } = event;

        const currentOffset = offset.get();
        const currentZoom = zoom.get();

        const newZoom = currentZoom - (deltaY / 500);
        if (newZoom > (maxZoom ?? 10) || newZoom < (minZoom ?? 0.5)) return;

        const boundingBox = currentTarget.getBoundingClientRect();

        const delta = 1 - (newZoom / currentZoom);

        const moveAmount = {
          x: delta * (clientX - boundingBox.x - currentOffset.x),
          y: delta * (clientY - boundingBox.y - currentOffset.y),
        };

        const zoomOffset = {
          x: currentOffset.x + moveAmount.x,
          y: currentOffset.y + moveAmount.y,
        };

        offset.set(zoomOffset);
        zoom.set(newZoom);
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
