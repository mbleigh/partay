import { db, auth, analytics } from "./firebase";
import { setState, subscribe } from "./state";

auth.onAuthStateChanged((user) => {
  if (!user) {
    return auth.signInAnonymously();
  }

  analytics.setUserId(user.uid);
  setState({ uid: user.uid });
});

const listeners: { [name: string]: Function | null } = {
  user: null,
  game: null,
};

subscribe((state) => {
  if (state.uid && !listeners.user) {
    const ref = db.ref("users").child(state.uid);
    listeners.user = () => {
      ref.off("value");
    };
    ref.on("value", (snap) => {
      setState({ user: snap.val() });
    });
  } else if (!state.uid && listeners.user) {
    listeners.user();
    listeners.user = null;
    setState({ user: undefined });
  }

  document.body.classList.toggle("in-room", !!state.room);

  if (state.room && !listeners.game) {
    const ref = db.ref("games/phraseology/rooms").child(state.room);
    ref.on(
      "value",
      (snap) => {
        setState({ game: snap.val() });
      },
      (err: Error) => {
        console.error(err);
        setState({ error: { message: "Unable to listen to game state." } });
      }
    );
    listeners.game = () => {
      ref.off("value");
    };
  } else if (!state.room && listeners.game) {
    listeners.game();
    listeners.game = null;
    if (state.game) {
      setState({ game: undefined });
    }
  }
});
