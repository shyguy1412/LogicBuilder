// import { WorkspaceStore } from "@/store/workspace";
import { createActor, createMachine } from "xstate";

const AppState = createMachine({
  id: "app-state",
  initial: "workspace",
  context: {
    // workspace: WorkspaceStore,
  },
  states: {
    workspace: {},
    other: {},
  },
});

const AppStateActor = createActor(AppState);

// export const AppStore = createStore({
//   context: {
//     workspace: WorkspaceStore
//   },
//   on: {
//   }
// });
AppStateActor.start;
