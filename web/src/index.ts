import "./components/phraseology/phrase-game";

import "./routes";
import "./listeners";
import { createRoom, joinRoom } from "./actions/common";
import { formValue } from "./helpers/html";

document.getElementById("start")!.addEventListener("click", (e) => {
  e.preventDefault();
  return createRoom("phraseology", formValue("#join-name"));
});

document.getElementById("join")!.addEventListener("submit", (e) => {
  e.preventDefault();
  return joinRoom(
    "phraseology",
    formValue("#join-room"),
    formValue("#join-name")
  );
});
