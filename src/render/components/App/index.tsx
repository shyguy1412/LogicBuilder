import { h } from "preact";
import style from "./App.module.css";
import { Menu, Sidebar } from "@/lib/components/Sidebar";
import { Statusbar } from "@/components/Statusbar";
import { createRouter, useRouter } from "@/lib/Router";
import { Titlebar } from "@/lib/components/Titlebar";
import { PiCircuitry, PiCpu, PiFile, PiGear } from "react-icons/pi";
import { Lumber } from "@/lib/log/Lumber";
import { Workspace } from "@/components/Workspace";
import { ComponentList } from "@/components/ComponentList";
import { useConstant } from "@/lib/components/hooks";

export const Router = createRouter({
  workspace: () => <Workspace />,
  other: () => <div>Other</div>,
}, "workspace");

const Menus: Menu[][] = [
  [
    {
      icon: PiCircuitry,
      name: "circuits",
      menu: () => <ComponentList></ComponentList>,
    },
    {
      icon: PiFile,
      name: "explorer",
      menu: () => <div>explorer</div>,
    },
  ],
  [
    {
      icon: PiGear,
      name: "settings",
      menu: () => <div>Settings</div>,
    },
  ],
];

Lumber.blockChannel(Lumber.RENDER);
Lumber.blockChannel(Lumber.HOOK);

export function App() {
  const { View } = useRouter(Router);

  Lumber.log(Lumber.RENDER, "APP RENDER");

  return (
    <div class={style.app}>
      <Titlebar
        minimize={useConstant(() => titlebar.minimize())}
        maximize={useConstant(() => titlebar.maximize())}
        // close={() => titlebar.close}
        close={useConstant(() => {})}
        title="Logic Builder"
        icon={PiCpu}
      />
      <div class={style.view}>
        <Sidebar menus={Menus} />
        <View />
      </div>
      <Statusbar />
    </div>
  );
}

export * from "./constants";
