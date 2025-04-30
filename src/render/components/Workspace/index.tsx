import "./Workspace.module.css";
import { h } from "preact";
import { useMemo } from "preact/hooks";
import { createAtom } from "@xstate/store";
import { Lumber } from "@/components/lib/log/Lumber";
import { GridDraggable, GridSurface } from "@/components/GridSurface";

type Props = {};

export function Workspace({}: Props) {
  Lumber.log(Lumber.RENDER, "WORKSPACE RENDER");

  const pos = useMemo(() => createAtom({ x: 0, y: 0 }), []);
  const offset = useMemo(() => createAtom({ x: 0, y: 0 }), []);
  const zoom = useMemo(() => createAtom(1), []);
  // useSelector(zoom, (pos) => pos);
  // useSelector(offset, (pos) => pos);
  // useSelector(pos, (pos) => pos);

  // useEffect(() => {
  //   const interval = setInterval(
  //     () => pos.set({ x: pos.get().x + 1, y: 0 }),
  //     100,
  //   );
  //   return () => clearInterval(interval);
  // });
  // const [{ x, y }, setPos] = useState({ x: 0, y: 0 });

  return (
    <GridSurface
      zoom={1.4}
      offsetX={offset.get().x}
      offsetY={offset.get().y}
      onZoomUpdate={(newZoom) => zoom.set(newZoom)}
      onOffsetUpdate={(newOffset) => offset.set(newOffset)}
    >
      <GridDraggable
        width={3}
        height={5}
        {...pos.get()}
        onPosUpdate={(newPos) => pos.set(newPos)}
      >
      </GridDraggable>
    </GridSurface>
  );
}
