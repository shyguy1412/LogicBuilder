import "./index.css";
import "normalize.css";
import { Fragment, h, hydrate, render } from "preact";
import { HelloWorld } from "@/render/components/HelloWorld";
import { Titlebar } from "@/render/components/Titlebar";

type Props = {};

function Index({}: Props) {
    return (
        <>
            <Titlebar></Titlebar>
            {/* <App>
                <Sidebar></Sidebar>
                <View></View>
            </App> */}
        </>
    );
}

console.log("LOADED");

render(<Index></Index>, document.body);
