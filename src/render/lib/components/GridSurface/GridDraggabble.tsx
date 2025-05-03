import { h } from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";
import style from "./GirdSurface.module.css";
import { Lumber } from "@/lib/log/Lumber";
import { useControlledState } from "@/lib/components/hooks";
import { Point } from "@/lib/types/Geometry";
import { OffsetContext } from "@/lib/components/GridSurface";
import { HTMLAttributes, memo, PropsWithChildren } from "preact/compat";
import { access } from "original-fs";

type Props = {
  width: number;
  height: number;
  x: number;
  y: number;
  onDragStart?: (pos: Point) => void;
  onDrag?: (pos: Point) => void;
  onDragStop?: (pos: Point) => void;
};
type PropsWithAttributes =
  & Props
  & Omit<HTMLAttributes<HTMLDivElement>, keyof Props>;

export namespace GridDraggable {
  export type Props = Parameters<typeof GridDraggable>[0];
}

export const GridDraggable = memo((
  {
    width,
    height,
    x,
    y,
    children,
    onDragStart,
    onDrag,
    onDragStop,
    ...props
  }: PropsWithChildren<PropsWithAttributes>,
) => {
  Lumber.log(Lumber.RENDER, "GRID DRAGGABLE RENDER");
  const offsetAtom = useContext(OffsetContext);

  //this lets the component update its own position
  //position changes from the parent will still cause updates
  const [pos, setPos, posAtom] = useControlledState(
    (x, y) => ({ x, y }),
    [x, y],
    onDrag,
  );
  const [grabOffset, setGrabOffset] = useState<Point>();

  const ref = useRef<HTMLDivElement>(null);

  const movehandler = useCallback((ev: MouseEvent) => {
    if (!ref.current) return;
    if (!grabOffset) return;
    const offset = offsetAtom.get();
    const em = +getComputedStyle(ref.current).fontSize.slice(0, -2);
    const boundingBox = ref.current.parentElement!.getBoundingClientRect();

    const pos = {
      x: Math.round(
        (ev.clientX - boundingBox.x - offset.x - grabOffset.x) / em,
      ),
      y: Math.round(
        (ev.clientY - boundingBox.y - offset.y - grabOffset.y) / em,
      ),
    };

    //Keeping the old pos object if x and y didnt change prevents unneccessary rerenders
    // setPos((oldPos) => {
    //   if (oldPos.x == pos.x && oldPos.y == pos.y) return oldPos;
    //   return pos;
    // });
    setPos(pos);
  }, [grabOffset, offsetAtom]);

  useEffect(() => {
    Lumber.log(Lumber.HOOK, "EFFECT - GridDraggable move");
    if (!grabOffset) return;

    const controller = new AbortController();
    const { signal } = controller;

    window.addEventListener("mousemove", movehandler, { signal });
    window.addEventListener("mouseup", () => {
      document.body.style.cursor = "";
      setGrabOffset(undefined);
      controller.abort();
      onDragStop?.(posAtom.get());
    }, { once: true, signal });
    document.body.style.cursor = "grabbing"; //! todo overwrite other cursors

    return () => controller.abort();
  }, [grabOffset, posAtom, onDragStop]);

  return (
    <div
      ref={ref}
      {...props}
      class={style.griddraggable + " " + (props.className ?? props.class ?? "")}
      style-grid-draggable=""
      data-scale-w={Math.round(width)}
      data-scale-h={Math.round(height)}
      data-pos-x={Math.round(pos.x)}
      data-pos-y={Math.round(pos.y)}
      onMouseDown={(event) => {
        event.stopPropagation();
        const transform = getComputedStyle(event.currentTarget).transform
          .slice(7, -1)
          .split(", ")
          .map(Number);

        const cos = transform[0]!;
        const sin = transform[1]!;
        const angle = Math.acos(cos) * Math.sign(sin);
        const angleDeg = (angle * (180 / Math.PI) + 360) % 360;
        const boundingBox = adjustBoundingBoxForRotation(
          angleDeg,
          event.currentTarget.getBoundingClientRect(),
        );

        const grabOffset = {
          x: event.clientX - boundingBox.x,
          y: event.clientY - boundingBox.y,
        };
        setGrabOffset(grabOffset);
        onDragStart?.({ ...pos });
      }}
    >
      {children}
    </div>
  );
});

const adjustBoundingBoxForRotation = (
  angle: number,
  boundingBox: DOMRect,
): Point => {
  if (angle > 90 && angle <= 180) {
    return {
      x: boundingBox.right,
      y: boundingBox.top,
    };
  }

  if (angle > 180 && angle <= 270) {
    return {
      x: boundingBox.right,
      y: boundingBox.bottom,
    };
  }

  if (angle > 270 && angle <= 360) {
    return {
      x: boundingBox.left,
      y: boundingBox.bottom,
    };
  }

  return {
    x: boundingBox.x,
    y: boundingBox.y,
  };
};
