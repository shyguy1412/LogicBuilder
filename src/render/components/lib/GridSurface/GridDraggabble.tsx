import { h } from "preact";
import {
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/compat";
import style from "./GirdSurface.module.css";
import { createAtom } from "@xstate/store";
import { Lumber } from "@/components/lib/log/Lumber";

type Props = {
  width: number;
  height: number;
  x: number;
  y: number;
  onPosUpdate?: (pos: { x: number; y: number }) => void;
};

export const GridDraggable = memo((
  { width, height, children, onPosUpdate, ...props }: PropsWithChildren<Props>,
) => {
  Lumber.log(Lumber.RENDER, "GRID DRAGGABLE RENDER");

  const pos = useMemo(
    () => {
      return createAtom({
        x: props.x,
        y: props.y,
      });
    },
    [props.x, props.y],
  );
  const { x, y } = pos.get();

  const [attached, setAttached] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Lumber.log(Lumber.HOOK, "EFFECT - GridDraggable pos");
    const { unsubscribe } = pos.subscribe(({ x, y }) => {
      if (!ref.current) return;
      ref.current.setAttribute("data-pos-x", Math.round(x) + "");
      ref.current.setAttribute("data-pos-y", Math.round(y) + "");
      onPosUpdate?.({ x, y });
    });
    return unsubscribe;
  }, [pos]);

  const movehandler = useCallback((ev: MouseEvent) => {
    if (!ref.current) return;
    const em = +getComputedStyle(ref.current).fontSize.slice(0, -2);

    const x = pos.get().x + (ev.movementX / em);
    const y = pos.get().y + (ev.movementY / em);

    pos.set({ x, y });
  }, [pos]);

  useEffect(() => {
    Lumber.log(Lumber.HOOK, "EFFECT - GridDraggable move");
    if (!attached) return;

    window.addEventListener("mousemove", movehandler);
    window.addEventListener("mouseup", () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", movehandler);
      setAttached(false);
    }, {
      once: true,
    });
    document.body.style.cursor = "grabbing"; //! todo overwrite other cursors

    return () => window.removeEventListener("mousemove", movehandler);
  }, [attached, pos]);

  return (
    <div
      ref={ref}
      class={style.griddraggable}
      style-grid-draggable=""
      data-scale-w={Math.round(width)}
      data-scale-h={Math.round(height)}
      data-pos-x={Math.round(x)}
      data-pos-y={Math.round(y)}
      onMouseDown={(event) => {
        event.stopPropagation();
        setAttached(true);
      }}
    >
      {children}
    </div>
  );
});
