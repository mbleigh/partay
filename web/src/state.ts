import createStore from "unistore";
import { State } from "./types";

const store = createStore<State>({});

const [setState, getState, subscribe] = [
  store.setState,
  store.getState,
  store.subscribe,
];

Object.defineProperty(window, "state", {
  get: () => {
    return getState();
  },
});

export { setState, getState, subscribe };
