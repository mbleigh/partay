import createStore from "unistore";
import { auth } from "./firebase";
import { State, PageType } from "./models";

const store = createStore<State>({});

const getState = store.getState;
const setState = function(state) {
  console.log('setState', Object.keys(state));
  store.setState(state);
}
const subscribe = store.subscribe;
const unsubscribe = store.unsubscribe;

subscribe(state => window['state'] = state);

export {getState, setState, subscribe, unsubscribe}
