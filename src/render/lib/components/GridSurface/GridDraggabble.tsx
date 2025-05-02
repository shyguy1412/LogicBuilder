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
import { memo, PropsWithChildren } from "preact/compat";

type Props = {
  width: number;
  height: number;
  x: number;
  y: number;
  onPosUpdate?: (pos: { x: number; y: number }) => void;
};

export const GridDraggable = memo((
  {
    width,
    height,
    children,
    ...props
  }: PropsWithChildren<Props>,
) => {
  const offset = useContext(OffsetContext).get();

  //this lets the component update its own position
  //position changes from the parent will still cause updates
  const [pos, setPos] = useControlledState(
    (x, y) => ({ x, y }),
    [props.x, props.y],
    props.onPosUpdate,
  );
  const [grabOffset, setGrabOffset] = useState<Point>();

  const ref = useRef<HTMLDivElement>(null);
  Lumber.log(Lumber.RENDER, "GRID DRAGGABLE RENDER", ref);

  const movehandler = useCallback((ev: MouseEvent) => {
    if (!ref.current) return;
    if (!grabOffset) return;
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
    setPos((oldPos) => {
      if (oldPos.x == pos.x && oldPos.y == pos.y) return oldPos;
      return pos;
    });
  }, [grabOffset]);

  useEffect(() => {
    Lumber.log(Lumber.HOOK, "EFFECT - GridDraggable move");
    if (!grabOffset) return;

    window.addEventListener("mousemove", movehandler);
    window.addEventListener("mouseup", () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", movehandler);
      setGrabOffset(undefined);
    }, {
      once: true,
    });
    document.body.style.cursor = "grabbing"; //! todo overwrite other cursors

    return () => window.removeEventListener("mousemove", movehandler);
  }, [grabOffset]);

  return (
    <div
      ref={ref}
      class={style.griddraggable}
      style-grid-draggable=""
      data-scale-w={Math.round(width)}
      data-scale-h={Math.round(height)}
      data-pos-x={Math.round(pos.x)}
      data-pos-y={Math.round(pos.y)}
      onMouseDown={(event) => {
        event.stopPropagation();
        const boundingBox = event.currentTarget.getBoundingClientRect();
        const grabOffset = {
          x: event.clientX - boundingBox.x,
          y: event.clientY - boundingBox.y,
        };
        setGrabOffset(grabOffset);
      }}
    >
      {children}
    </div>
  );
});
