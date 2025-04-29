import { h } from "preact";
import style from "./Statusbar.module.css";
import { memo } from "preact/compat";

type Props = {};

export const Statusbar = memo(({}: Props) => {
  console.log("INFO BAR RENDER");
  return <div class={style.statusbar}>Info Bar</div>;
});
