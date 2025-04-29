import { h } from "preact";
import { useEffect } from "preact/hooks";
import style from "./App.module.css";
import { createRouter, useRouter, View } from "@/components/lib/View";
import { Sidebar } from "@/components/lib/Sidebar";
import { InfoBar } from "@/components/lib/InfoBar";
type Props = {};

export const Router = createRouter({
  home: () => <div>Home</div>,
  other: () => <div>Other</div>,
}, "home");

export function App(props: Props) {
  const router = useRouter(Router);
  
  useEffect(() => {
    setTimeout(() => router.setRoute({ route: "other" }), 1000);
  }, []);

  return (
    <div class={style.app}>
      <div>
        <Sidebar></Sidebar>
        <View router={Router}></View>
      </div>
      <InfoBar></InfoBar>
    </div>
  );
}
