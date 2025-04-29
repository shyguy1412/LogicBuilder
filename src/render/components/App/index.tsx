import { h } from "preact";
import style from "./App.module.css";
import { Menu, Sidebar } from "@/components/lib/Sidebar";
import { Statusbar } from "@/components/Statusbar";
import { createRouter, useRouter } from "@/components/lib/Router";
import { Titlebar } from "@/components/lib/Titlebar";
import { PiCircuitry, PiCpu, PiFile, PiGear } from "react-icons/pi";
import { useCallback } from "preact/hooks";
type Props = {};

export const Router = createRouter({
  home: () => <div>Home</div>,
  other: () => <div>Other</div>,
}, "home");

const Menus: Menu[][] = [
  [{
    icon: PiFile,
    name: "explorer",
    menu: () => (
      <div>
        Explorer
        <button onClick={() => Router.trigger.setRoute({ route: "home" })}>
          home
        </button>
        <button onClick={() => Router.trigger.setRoute({ route: "other" })}>
          other
        </button>
      </div>
    ),
  }, {
    icon: PiCircuitry,
    name: "circuits",
    menu: () => (
      <div>
        circuits
      </div>
    ),
  }],
  [{
    icon: PiGear,
    name: "settings",
    menu: () => <div>Settings</div>,
  }],
];

export function App(props: Props) {
  const { View } = useRouter(Router);

  console.log("APP RENDER");

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
