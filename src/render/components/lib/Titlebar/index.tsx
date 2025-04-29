import { h } from "preact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrochip,
  faWindowMinimize,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import style from "./Titlebar.module.css";

type Props = {};

/**
 * Titlebar. Shows app icon and window controls. Can be used to drag window
 */
export function Titlebar({}: Props) {
  return (
    <div class={style.titlebar}>
      <div>
        <FontAwesomeIcon icon={faMicrochip}></FontAwesomeIcon>
      </div>

      <div>
        Logic Builder
      </div>

      <div>
        <div
          onClick={(_) => titlebar.minimize()}
        >
          <FontAwesomeIcon icon={faWindowMinimize}></FontAwesomeIcon>
        </div>
        <div
          onClick={(_) => titlebar.maximize()}
        >
          <FontAwesomeIcon icon={faSquare}></FontAwesomeIcon>
        </div>
        <div
          onClick={(_) => titlebar.close()}
        >
          <FontAwesomeIcon icon={faX}></FontAwesomeIcon>
        </div>
      </div>
    </div>
  );
}
