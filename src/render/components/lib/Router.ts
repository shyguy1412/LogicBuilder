import { createStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { h } from "preact";
import { useCallback, useMemo } from "preact/hooks";


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
      setRoute: (_, event: { route: keyof R; }) => ({
        route: event.route,
        view: router[event.route],
      }),
    },
  });

  return store;
}

export function useRouter<R extends string>(router: Router<R>) {
  return {
    setRoute: useCallback((route: R) => router.trigger.setRoute({ route }), [router]),
    route: useSelector(router, (state) => state.context.route),
    View: useSelector(router, (state) => state.context.view)
  };
}
