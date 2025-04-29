import "./index.css";
import "normalize.css";
import { Fragment, h, render } from "preact";
import { Titlebar } from "@/components/lib/Titlebar";
import { App } from "@/components/App";

type Props = {};

function Index({}: Props) {
  return (
    <>
      <Titlebar></Titlebar>
      <App></App>
    </>
  );
}

render(<Index></Index>, document.body);
