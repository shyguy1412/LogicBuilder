import { h } from "preact";
import style from "./Titlebar.module.css";
import { IconType } from "react-icons";
import {
  FaRegSquare,
  FaWindowMinimize,
  FaX,
} from "react-icons/fa6";
import { memo } from "preact/compat";

type Props = {
  title: string;
  icon: IconType;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
};

/**
 * Titlebar. Shows app icon and window controls. Can be used to drag window
 */
export const Titlebar = memo(
  ({ title, icon, minimize, maximize, close }: Props) => {
    console.log("TITLEBAR RENDER");

    return (
      <div class={style.titlebar}>
        <div>
          {h(icon, {})}
        </div>

        <div>
          {title}
        </div>

        <div>
          <div
            onClick={(_) => minimize()}
          >
            <FaWindowMinimize />
          </div>
          <div
            onClick={(_) => maximize()}
          >
            <FaRegSquare />
          </div>
          <div
            onClick={(_) => close()}
          >
            <FaX />
          </div>
        </div>
      </div>
    );
  },
);
