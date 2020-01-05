import "./components/PartayApp";

import * as actions from "./actions";
import page from "page";
import { auth, db } from "./firebase";
import { setState, subscribe, getState } from "./state";

page("/", ctx => setState({page: "home", code: null}));
page("/host/:code", (ctx) => setState({page: 'host', code: ctx.params.code}));
page("/play/:code", ctx => setState({page: "play", code: ctx.params.code}));
page();

auth.onAuthStateChanged(user => {
  if (!user) {
    auth.signInAnonymously();
    setState({user: null});
  }
  setState({user: {uid: user.uid, name: user.displayName, photo: user.photoURL}});
});

let curCode = getState().code;
let ref: firebase.database.Reference;
subscribe(({code}) => {
  if (curCode !== code || code && !ref) {
    ref?.off('value');
    curCode = code;
    if (code) {
      ref = db.ref('rooms').child(code);
      ref.on('value', snap => setState({data: snap.val()}));
    } else {
      ref = null;
    }
  }
});

document.addEventListener("action", (e: CustomEvent) => {
  return actions[e.detail.type](e.detail.payload);
});
