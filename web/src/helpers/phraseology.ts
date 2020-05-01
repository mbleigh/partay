import { PhraseGame, PhrasePlayer, PhraseTeam } from "../types";
import { SERVER_TIMESTAMP } from "../firebase";
import { asArray } from "./data";
import { getState } from "../state";

export const TURN_DURATION = 60 * 1000;

export function newGame(captain: string, name: string): PhraseGame {
  return {
    create_time: SERVER_TIMESTAMP,
    state: "lobby",
    captain: captain,
    players: {
      [captain]: {
        name,
        team: "red",
        captain: true,
        join_time: SERVER_TIMESTAMP,
      },
    },
  };
}

export function generateTurnOrder(): { red: string[]; blue: string[] } {
  return asArray(getState().game!.players!)
    .sort(() => Math.random() - 0.5)
    .reduce(
      (o, p) => {
        (o as any)[p.team].push(p.key);
        return o;
      },
      { last_team: "blue", red: [], red_cursor: 0, blue: [], blue_cursor: 0 }
    );
}
