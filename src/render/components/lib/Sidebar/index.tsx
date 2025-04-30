import { FunctionComponent, h } from "preact";
import style from "./Sidebar.module.css";
import { useCallback, useMemo, useRef, useState } from "preact/hooks";
import {
  createRouter,
  Router,
  RouteTable,
  useRouter,
} from "@/components/lib/Router";
import { IconType } from "react-icons";
import { memo } from "preact/compat";
import { createAtom } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { Lumber } from "@/components/lib/log/Lumber";

export type Menu = {
  name: string;
  tooltip?: string;
  icon: IconType;
  menu: () => h.JSX.Element;
};

type Props = {
  menus: Menu[][];
};

export const Sidebar = memo(SidebarComponent);

function SidebarComponent({ menus }: Props) {
  Lumber.log(Lumber.RENDER, "SIDEBAR RENDER");

  const Router = useMemo(() => {
    const routes = menus.flat().reduce(
      (prev, cur) => (prev[cur.name] = cur.menu, prev),
      {} as RouteTable,
    );
    return createRouter(routes, menus[0][0].name);
  }, [menus]);

  const { View } = useRouter(Router);

  const width = useMemo(() => createAtom(50), []);

  const ref = useRef<HTMLDivElement>(null);

  const resize = useCallback(
    (startWidth: number, startX: number) => (ev: MouseEvent) => {
      width.set(startWidth - (startX - ev.clientX));
    },
    [],
  );

  const ViewContainer = useCallback(() => {
    Lumber.log(Lumber.RENDER, "VIEW CONTAINER RERENDER");

    const currentWidth = useSelector(width, (state) => state);
    const view = View();

    if (!view) return false;

    return (
      <div ref={ref} style={{ width: `clamp(5em, ${currentWidth}px, 20em)` }}>
        {view}
      </div>
    );
  }, [View]);

  return (
    <div class={style.sidebar}>
      <div>
        {menus.map((menus) => (
          <div>
            {menus.map((menu) => <MenuItem router={Router} menu={menu} />)}
          </div>
        ))}
      </div>
      <ViewContainer></ViewContainer>
      <div
        onMouseDown={(event) => {
          const movehandler = resize(
            ref.current ? ref.current.clientWidth : width.get(),
            event.clientX,
          );
          window.addEventListener("mousemove", movehandler);
          window.addEventListener("mouseup", () => {
            document.body.style.cursor = "";
            window.removeEventListener("mousemove", movehandler);
          }, {
            once: true,
          });
          document.body.style.cursor = "e-resize";
        }}
      >
      </div>
    </div>
  );
}

type MenuItemProps = {
  menu: Menu;
  router: Router<string>;
};

const MenuItem = memo(({ menu, router }: MenuItemProps) => {
  Lumber.log(Lumber.RENDER, "MENU ITEM RENDER: " + menu.name);

  const { route, setRoute } = useRouter(router);

  return (
    <div
      data-active={route == menu.name ? "" : undefined}
      class={style.menuitem}
      onClick={() => setRoute(menu.name == route ? "@None" : menu.name)}
    >
      {h(menu.icon, {})}
    </div>
  );
});
