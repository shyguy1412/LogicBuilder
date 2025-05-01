import { h } from "preact";
import style from "./App.module.css";
import { Menu, Sidebar } from "@/components/lib/Sidebar";
import { Statusbar } from "@/components/Statusbar";
import { createRouter, useRouter } from "@/components/lib/Router";
import { Titlebar } from "@/components/lib/Titlebar";
import { PiCircuitry, PiCpu, PiFile, PiGear } from "react-icons/pi";
import { useCallback } from "preact/hooks";
import { Lumber } from "@/components/lib/log/Lumber";
import { Workspace } from "@/components/Workspace";
import { ComponentList } from "@/components/ComponentList";

export const Router = createRouter({
  workspace: () => <Workspace />,
  other: () => <div>Other</div>,
}, "workspace");

const Menus: Menu[][] = [
  [{
    icon: PiFile,
    name: "explorer",
    menu: () => (
      <ComponentList></ComponentList>
      // <div onClick={() => Router.trigger.setRoute({ route: "workspace" })}>
      //   Explorer
      // </div>
    ),
  }, {
    icon: PiCircuitry,
    name: "circuits",
    menu: () => (
      <div>circuits</div>
      // <div onClick={() => Router.trigger.setRoute({ route: "other" })}>
      //   circuits
      // </div>
    ),
  }],
  [{
    icon: PiGear,
    name: "settings",
    menu: () => <div>Settings</div>,
  }],
];

// Lumber.blockChannel(Lumber.RENDER);
// Lumber.blockChannel(Lumber.HOOK);

export function App() {
  const { View } = useRouter(Router);

  Lumber.log(Lumber.RENDER, "APP RENDER");

  return (
    <div class={style.app}>
      <Titlebar
        minimize={useCallback(() => titlebar.minimize(), [])}
        maximize={useCallback(() => titlebar.maximize(), [])}
        // close={() => titlebar.close}
        close={useCallback(() => {}, [])}
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
