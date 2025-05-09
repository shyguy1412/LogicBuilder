import style from "./GirdSurface.module.css";

import { memo, PropsWithChildren, TargetedEvent } from "preact/compat";
import { useCallback, useRef } from "preact/hooks";
import { createContext, h } from "preact";

import { Lumber } from "@/lib/log/Lumber";
import { useControlledState } from "@/lib/components/hooks";
import { createAtom } from "@xstate/store";

type Point = { x: number; y: number };

type Props = {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
  offsetX?: number;
  offsetY?: number;
  onZoomUpdate?: (zoom: number) => void;
  onOffsetUpdate?: (offset: Point) => void;
};

export const OffsetContext = createContext(createAtom({ x: 0, y: 0 }));

export namespace GridSurface {
  export type Props = Parameters<typeof GridSurface>[0];
}

export const GridSurface = memo((
  {
    children,
    minZoom,
    maxZoom,
    zoomSpeed,
    ...props
  }: PropsWithChildren<Props>,
) => {
  Lumber.log(Lumber.RENDER, "GRID SURFACE RENDER");

  const [offset, setOffset, offsetAtom] = useControlledState(
    (x, y) => ({ x: x ?? 0, y: y ?? 0 }),
    [props.offsetX, props.offsetY],
    props.onOffsetUpdate,
  );

  const [zoom, setZoom] = useControlledState(
    (zoom) => zoom,
    [props.zoom],
    props.onZoomUpdate,
  );

  const ref = useRef<HTMLDivElement>(null);

  const onWheel = useCallback(
    (event: TargetedEvent<HTMLDivElement, WheelEvent>) => {
      const { currentTarget, deltaY, clientX, clientY } = event;

      //zoom factor describes how far each point should move away from origin
      //when zoomed
      //zoom factor of 2 means evey point moves twice as far away
      //this makes the percieved zoom constant
      const targetZoomFactor = Math.sign(deltaY) * (zoomSpeed ?? 0.1);

      const newZoom = Math.min(
        maxZoom ?? 10,
        Math.max(minZoom ?? 0, zoom - (targetZoomFactor * zoom)),
      );
      if (newZoom == zoom) return;

      const zoomFactor = 1 - (newZoom / zoom);

      const boundingBox = currentTarget.getBoundingClientRect();

      const moveAmount = {
        x: zoomFactor * (clientX - boundingBox.x - offset.x),
        y: zoomFactor * (clientY - boundingBox.y - offset.y),
      };

      const zoomOffset = {
        x: offset.x + moveAmount.x,
        y: offset.y + moveAmount.y,
      };

      setOffset(zoomOffset);
      setZoom(newZoom);
    },
    [zoom, offset, setOffset, setZoom],
  );

  const onMouseDown = useCallback(
    (event: TargetedEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
      const controller = new AbortController();
      const { signal } = controller;

      const button = event.button;
      //check if another button is already pressed
      if ((event.buttons & (event.buttons - 1)) != 0) return;
      // if (event.button == 0 && !event.getModifierState("Control")) return;
      if (event.button >= 1) return;
      // if (event.button > 2) return;

      const startPos = offset;
      const startMouse = {
        x: event.clientX,
        y: event.clientY,
      };
      window.addEventListener("mousemove", (event) => {
        if (!ref.current) return;
        const x = startPos.x - (startMouse.x - event.clientX);
        const y = startPos.y - (startMouse.y - event.clientY);
        setOffset({ x, y });
      }, { signal });

      window.addEventListener("mouseup", (event) => {
        if ((event.buttons & button) == 1) return;
        document.body.style.cursor = "";
        controller.abort();
      }, { once: true });

      document.body.style.cursor = "move";
    },
    [offset, setOffset],
  );

  return (
    <div
      ref={ref}
      style-grid-surface=""
      data-zoom={zoom}
      data-min-zoom={minZoom}
      data-max-zoom={maxZoom}
      data-offset-x={offset.x}
      data-offset-y={offset.y}
      class={style.surface}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
    >
      <OffsetContext.Provider value={offsetAtom}>
        {children}
      </OffsetContext.Provider>
    </div>
  );
});

export { GridDraggable } from "./GridDraggabble";
