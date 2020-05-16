export type GameType = "phraseology";

export type PhraseGameState = "lobby" | "prep" | "play" | "end";
export type PhraseTeam = "red" | "blue";

export interface PhraseTurn {
  deck: number[];
  cursor: number;
  player: string;
  start_time?: number | null;
  guessed?: number[] | null;
  skipped?: number[] | null;
}

export interface PhraseRound {
  remaining: number[];
  type: "anything" | "one_word" | "emoji";
  turns?: {
    [turnId: string]: PhraseTurn;
  };
  red_score?: number;
  blue_score?: number;
  end_time?: number;
  emoji?: string;
}

export interface Phrase {
  set: string;
  id: number;
  phrase: string;
  clue: string;
  tags?: string[] | null;
  franchise?: string | null;
  rating?: string | null;
  player?: string | null;
  attribution?: string | null;
}

export interface Keyable {
  key?: string;
}

export interface PhrasePlayer extends Keyable {
  name: string;
  captain?: boolean;
  team: PhraseTeam;
  join_time: number;
  deck?: number[] | null;
  discards?: number[] | null;
}

export interface PhraseGame {
  state: PhraseGameState;
  create_time: number;
  start_time?: number | null;
  end_time?: number | null;
  red_score?: number;
  blue_score?: number;
  captain: string;
  round?: number | null;
  turn?: string | null;
  pool?: number[] | null;
  deck?: number[] | null;
  readies?: {
    [uid: string]: boolean;
  };
  players: {
    [uid: string]: PhrasePlayer;
  };
  rounds?: {
    [roundKey: string]: PhraseRound;
  };
  turn_order?: {
    last_team: PhraseTeam;
    red: string[];
    red_cursor: number;
    blue: string[];
    blue_cursor: number;
  } | null;
  custom_phrases?: Phrase[];
}

export interface GameError {
  message: string;
}

export interface State {
  error?: GameError;
  uid?: string;
  user?: {
    name?: string;
    lastRoom?: string;
  };
  room?: string;
  game?: PhraseGame;
}
