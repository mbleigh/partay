import createStore from "unistore";
import { State } from "./types";

const store = createStore<State>({});

const [setState, getState, subscribe] = [
  (state: any) => {
    if ((window as any).DEBUG) {
      console.log("setState", state);
    }
    return store.setState(state);
  },
  store.getState,
  store.subscribe,
];

Object.defineProperty(window, "state", {
  get: () => {
    return getState();
  },
});

export { setState, getState, subscribe };
