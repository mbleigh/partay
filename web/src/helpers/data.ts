import {
  Keyable,
  GameType,
  PhraseTurn,
  PhraseRound,
  PhraseTeam,
} from "../types";
import { db } from "../firebase";
import { getState } from "../state";

export function asArray<T extends Keyable>(obj: { [key: string]: T }): T[] {
  const out = [];
  for (const key in obj) {
    out.push(Object.assign({ key }, obj[key]));
  }
  return out;
}

export function userRef(): firebase.database.Reference {
  return db.ref("users").child(getState().uid!);
}

export function roomRef(
  code?: string,
  game: GameType = "phraseology"
): firebase.database.Reference {
  code = code || getState().room;
  return db.ref("games").child(game).child("rooms").child(code!);
}

export function generateReadies(): { [key: string]: boolean } {
  const out: { [key: string]: boolean } = {};
  for (const k in getState().game?.players) {
    out[k] = false;
  }
  return out;
}

export function allReady(except?: string): boolean {
  const readies = getState().game?.readies;
  if (!readies) {
    return false;
  }
  for (const uid in readies) {
    if (uid === except) continue;
    if (readies[uid] === false) return false;
  }
  return true;
}

export function randomSort(): number {
  return Math.random() - 0.5;
}

export function currentTurn(): PhraseTurn | null {
  const { game } = getState();
  return currentRound()?.turns?.[game?.turn || ""] || null;
}

export function currentTurnPath(): string {
  return currentRoundPath() + "/turns/" + getState().game!.turn;
}

export function currentRound(): PhraseRound | null {
  const { game } = getState();
  return game?.rounds?.[`round${game?.round}`] || null;
}

export function currentRoundPath(): string {
  const { game } = getState();
  return `rounds/round${game!.round}`;
}

export function teamOfPlayer(id: string): PhraseTeam {
  const { game } = getState();
  return game!.players[id].team;
}

export function roundScore(roundNumber: number, team: PhraseTeam): number {
  const { game } = getState();
  const round: PhraseRound = game!.rounds![`round${roundNumber}`];

  let score = 0;
  for (const tid in round.turns) {
    if (teamOfPlayer(round.turns[tid].player) === team) {
      score += (round.turns[tid].guessed || []).length;
    }
  }

  return score;
}
