import { h } from "preact";
import style from "./InfoBar.module.css";

type Props = {};

export function InfoBar({}: Props) {
  console.log(style);

  return <div class={style["info-bar"]}>Info Bar</div>;
}
