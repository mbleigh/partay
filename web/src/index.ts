import "./components/phraseology/phrase-game";

import "./routes";
import "./listeners";
import { createRoom, joinRoom } from "./actions/common";
import { formValue } from "./helpers/html";
import { getState } from "./state";

document.getElementById("start")!.addEventListener("click", async (e) => {
  e.preventDefault();
  await createRoom("phraseology", formValue("#join-name"));
  const { error } = getState();
  if (error) {
    document.getElementById("top-error")!.innerText = error!.message;
  }
});

document.getElementById("join")!.addEventListener("submit", async (e) => {
  e.preventDefault();
  await joinRoom(
    "phraseology",
    formValue("#join-room"),
    formValue("#join-name")
  );

  const { error } = getState();
  if (error) {
    document.getElementById("top-error")!.innerText = error!.message;
  }
});

document.getElementById("instructions-btn")!.addEventListener("click", (e) => {
  document.getElementById("instructions-btn")!.classList.add("hidden");
  document.getElementById("instructions")!.classList.remove("hidden");
});
