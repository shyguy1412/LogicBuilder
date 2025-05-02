import style from "./GirdSurface.module.css";

import { PropsWithChildren } from "preact/compat";
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
  offsetX?: number;
  offsetY?: number;
  onZoomUpdate?: (zoom: number) => void;
  onOffsetUpdate?: (offset: Point) => void;
};

export const OffsetContext = createContext(createAtom({ x: 0, y: 0 }));

export function GridSurface(
  {
    children,
    minZoom,
    maxZoom,
    ...props
  }: PropsWithChildren<Props>,
) {
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

  const move = useCallback(
    (
      startPos: Point,
      startMouse: Point,
    ) =>
    (ev: MouseEvent) => {
      if (!ref.current) return;

      const x = startPos.x - (startMouse.x - ev.clientX);
      const y = startPos.y - (startMouse.y - ev.clientY);
      setOffset({ x, y });
    },
    [setOffset],
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
      onWheel={(event) => {
        const { currentTarget, deltaY, clientX, clientY } = event;

        //zoom factor describes how far each point should move away from origin
        //when zoomed
        //zoom factor of 2 means evey point moves twice as far away
        //this makes the percieved zoom constant
        const zoomFactor = Math.sign(deltaY) * 0.1;

        const newZoom = zoom - (zoomFactor * zoom);
        if (newZoom > (maxZoom ?? 10) || newZoom < (minZoom ?? 0.5)) return;

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
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
        const movehandler = move(offset, {
          x: event.clientX,
          y: event.clientY,
        });
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
      <OffsetContext.Provider value={offsetAtom}>
        {children}
      </OffsetContext.Provider>
    </div>
  );
}

export { GridDraggable } from "./GridDraggabble";
