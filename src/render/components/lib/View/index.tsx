import { FunctionComponent, h } from "preact";
import style from "./View.module.css";
import { createAtom, createStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";

type Props<R extends string> = {
  router: Router<R>;
};

export type View = () => h.JSX.Element;
export type Router<R extends string> = ReturnType<
  typeof createRouter<RouteTable<R>>
>;
export type RouteTable<R extends string = string> = { [route in R]: View };
export function createRouter<R extends RouteTable>(
  router: R,
  initial: keyof R,
) {
  const store = createStore({
    context: { route: initial, view: router[initial] },
    on: {
      setRoute: (context, event: { route: keyof R }) => ({
        route: event.route,
        view: router[event.route],
      }),
    },
  });

  return store;
}

export function useRouter<R extends string>(router: Router<R>) {
  return {
    setRoute: router.trigger.setRoute,
    route: useSelector(router, (state) => state.context.route),
  };
}

export function View<R extends string>({ router }: Props<R>) {
  const SelectedView: View = useSelector(
    router,
    (state) => state.context.view,
  );

  return (
    <div class={style.view}>
      <SelectedView></SelectedView>
    </div>
  );
}
