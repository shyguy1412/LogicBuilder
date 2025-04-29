import { FunctionComponent, h } from "preact";
import style from "./Sidebar.module.css";
import { useCallback, useMemo, useState } from "preact/hooks";
import {
  createRouter,
  Router,
  RouteTable,
  useRouter,
} from "@/components/lib/Router";
import { IconType } from "react-icons";
import { memo } from "preact/compat";
import { createAtom, createStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";

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
  console.log("SIDEBAR RENDER");

  const Router = useMemo(() => {
    const routes = menus.flat().reduce(
      (prev, cur) => (prev[cur.name] = cur.menu, prev),
      {} as RouteTable,
    );
    return createRouter(routes, menus[0][0].name);
  }, []);

  const { View } = useRouter(Router);

  const width = useMemo(() => createAtom(50), []);

  const resize = (startWidth: number, startX: number) => (ev: MouseEvent) => {
    // setWidth(startWidth - ev.clientX - startX);
    width.set(startWidth - (startX - ev.clientX));
  };

  const ViewContainer = ({ view }: { view: FunctionComponent }) => {
    const currentWidth = useSelector(width, (state) => state);
    return (
      <div style={{ width: `clamp(5em, ${currentWidth}px, 20em)` }}>
        {h(view, {})}
      </div>
    );
  };

  return (
    <div class={style.sidebar}>
      <div>
        {menus.map((menus) => (
          <div>
            {menus.map((menu) => <MenuItem router={Router} menu={menu} />)}
          </div>
        ))}
      </div>
      <ViewContainer view={View}></ViewContainer>
      <div
        onMouseDown={(event) => {
          const movehandler = resize(width.get(), event.clientX);
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
  console.log("MENU ITEM RENDER: " + menu.name);

  const { route, setRoute } = useRouter(router);

  return (
    <div
      data-active={route == menu.name ? "" : undefined}
      class={style.menuitem}
      onClick={() => setRoute(menu.name)}
    >
      <menu.icon />
    </div>
  );
});
