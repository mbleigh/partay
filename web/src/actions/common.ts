import { GameType, PhraseGame } from "../types";
import { SERVER_TIMESTAMP, logEvent } from "../firebase";
import { getState, setState } from "../state";
import { newGame } from "../helpers/phraseology";
import page from "page";
import { roomRef, userRef, currentPlayer } from "../helpers/data";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function generateCode(size = 4): string {
  let out = "";
  for (let i = 0; i < size; i++) {
    out += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }
  return out;
}

export async function createRoom(game: GameType, name: string): Promise<void> {
  if (!name) {
    return setState({
      error: { message: "You must provide a name to start a game." },
    });
  }
  const code = generateCode();
  setState({ error: undefined });
  await roomRef(code, game).set(newGame(getState().uid!, name));
  await userRef().update({
    name,
    last_room: code,
    last_join_time: SERVER_TIMESTAMP,
  });
  logEvent("create_room", { game });
  page(`/${code}`);
}

export async function joinRoom(
  game: GameType,
  code: string,
  name: string
): Promise<void> {
  if (!code) {
    return setState({
      error: { message: "You must provide a room code to join a game." },
    });
  } else if (!name) {
    return setState({
      error: { message: "You must provide a name to join a room." },
    });
  }

  code = code.toUpperCase();
  const ref = roomRef(code, game);
  const snap = await ref.once("value");
  if (!snap.exists()) {
    return setState({ error: { message: `Room ${code} does not exist.` } });
  }

  const gameData = snap.val() as PhraseGame;
  const uid = getState().uid!;

  // already in room, just redirect
  if (gameData.players?.[uid]) {
    page(`/${code}`);
    return;
  }

  if (gameData.state !== "lobby") {
    return setState({
      error: { message: `Game ${code} has already started, you cannot join.` },
    });
  }

  let playerCount = 0,
    redCount = 0,
    blueCount = 0;
  for (const uid in gameData.players) {
    playerCount++;
    gameData.players[uid].team === "red" ? redCount++ : blueCount++;
  }

  if (playerCount === 0) {
    return setState({
      error: {
        message: `Room ${code} has no players. Try starting a game instead.`,
      },
    });
  } else if (playerCount >= 16) {
    return setState({
      error: { message: `Room ${code} already has 16 players and is full.` },
    });
  }

  let team = "blue";
  if (redCount < blueCount) {
    team = "red";
  } else if (redCount === blueCount) {
    team = Math.random() > 0.5 ? "red" : "blue";
  }

  setState({ error: undefined });
  logEvent("join_room", { game });

  await ref.update({
    [`players/${uid}`]: { name, team, join_time: SERVER_TIMESTAMP },
  });
  await userRef().update({
    name,
    last_room: code,
    last_join_time: SERVER_TIMESTAMP,
  });

  page(`/${code}`);
}

export async function leaveRoom(): Promise<void> {
  if (!getState().room) {
    return;
  }

  if (currentPlayer()) {
    await roomRef().update({
      [`players/${getState().uid}`]: null,
    });
  }

  page("/");
}
