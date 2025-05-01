import { h } from "preact";
import style from "./Statusbar.module.css";
import { memo } from "preact/compat";
import { Lumber } from "@/lib/log/Lumber";

type Props = {};

export const Statusbar = memo(({}: Props) => {
  Lumber.log(Lumber.RENDER, "INFO BAR RENDER");
  return <div class={style.statusbar}>Info Bar</div>;
});
