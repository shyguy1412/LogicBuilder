import { h } from "preact";
import style from "./Sidebar.module.css";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createRouter, View } from "@/components/lib/View";

type Props = {};

export const Router = createRouter({
  "explorer": () => <div>Explorer</div>,
}, "explorer");

export function Sidebar({}: Props) {
  return (
    <div class={style.sidebar}>
      <div>
        <FontAwesomeIcon icon={faFile}></FontAwesomeIcon>
      </div>
      <View router={Router}></View>
    </div>
  );
}
