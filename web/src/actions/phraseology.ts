import { getState } from "../state";
import {
  roomRef,
  asArray,
  generateReadies,
  randomSort,
  currentTurn,
  currentRound,
  currentRoundPath,
  currentTurnPath,
  roundScore,
} from "../helpers/data";
import { generateDeck, dealDeck } from "../phraseology/deck";
import { SERVER_TIMESTAMP, increment } from "../firebase";
import { generateTurnOrder, newGame } from "../helpers/phraseology";
import { PhraseTeam, PhraseTurn, PhraseRound } from "../types";

/**
 * Triggered by a player to switch from their current team to the other team.
 */
export async function lobbySwitchTeams(): Promise<void> {
  const { uid, game, room } = getState();
  const newTeam = game?.players[uid!]?.team === "red" ? "blue" : "red";
  await roomRef().update({
    [`players/${uid}/team`]: newTeam,
  });
}
/**
 * Triggered by the game captain to reshuffle teams randomly (and evenly).
 */
export async function lobbyShuffleTeams(): Promise<void> {
  const { game } = getState();
  let redCount = 0,
    blueCount = 0;
  const update: { [k: string]: string } = {};
  for (const uid in game!.players) {
    let newTeam = redCount < blueCount ? "red" : "blue";
    if (redCount === blueCount) {
      newTeam = Math.random() > 0.5 ? "red" : "blue";
    }
    update[`players/${uid}/team`] = newTeam;
    newTeam === "red" ? redCount++ : blueCount++;
  }
  await roomRef().update(update);
}
/**
 * Triggered by the game captain to begin the game when everyone is in.
 */
export async function lobbyStart(): Promise<void> {
  const pool = generateDeck();
  const update: { [key: string]: any } = dealDeck(
    pool,
    asArray(getState().game!.players!).map((p) => `players/${p.key}/deck`)
  );
  Object.assign(update, {
    pool,
    start_time: SERVER_TIMESTAMP,
    state: "prep",
    readies: generateReadies(),
    turn_order: generateTurnOrder(),
  });
  await roomRef().update(update);
}
/**
 * Triggered during game prep to discard a phrase from the current player's deck.
 * @param id ID of the phrase to discard.
 */
export async function toggleDiscard(id: number): Promise<void> {
  const { uid, game } = getState();
  const discards: number[] = (game?.players?.[uid!].discards || []).slice();
  const i = discards.indexOf(id);
  if (i >= 0) {
    discards.splice(i, 1);
  } else if (discards.length >= 3) {
    return;
  } else {
    discards.push(id);
  }
  await roomRef().update({
    [`players/${uid!}/discards`]: discards,
  });
}
/**
 * Triggered during game prep to indicate ready to play.
 */
export async function toggleReady(): Promise<void> {
  const { uid, game } = getState();
  await roomRef().update({
    [`readies/${getState().uid!}`]: !(game!.readies![uid!] || false),
  });
}

/**
 * Triggered by captain when everyone is ready to start the game.
 */
export async function startPlay(): Promise<void> {
  const { game } = getState();
  let deck: number[] = game!.pool!.slice();
  for (const uid in game?.players) {
    deck = deck.filter((id) => !game?.players?.[uid]?.discards?.includes(id));
  }
  await roomRef().update({
    deck,
    state: "play",
    round: 0,
    rounds: {
      round1: {
        remaining: deck,
        type: "anything",
      },
      round2: {
        remaining: deck,
        type: "one_word",
      },
      round3: {
        remaining: deck,
        type: "emoji",
      },
    },
  });
  await startNextRound();
}

export async function nextTurn(): Promise<void> {
  const { rounds, round, turn_order } = getState().game!;
  const roundData = rounds![`round${round}`]!;

  const team: PhraseTeam = turn_order!.last_team === "blue" ? "red" : "blue";
  console.log("last team", turn_order?.last_team, "team", team);
  const teamCursor: number = (turn_order as any)[`${team}_cursor`];
  console.log(team, teamCursor, turn_order![team][teamCursor]);
  const player = turn_order![team][teamCursor];

  const ref = await roomRef()
    .child(`rounds/round${round}/turns`)
    .push({
      deck: roundData.remaining.slice().sort(randomSort),
      cursor: 0,
      player,
    });
  await roomRef().update(
    Object.assign({
      turn: ref.key,
      "turn_order/last_team": team,
      [`turn_order/${team}_cursor`]:
        (teamCursor + 1) % turn_order![team].length,
    })
  );
}

/**
 * Triggered by cluegiver when they are ready to start giving clues.
 */
export async function turnStart(): Promise<void> {
  const { game } = getState();
  await roomRef().update({
    [`rounds/round${game!.round}/turns/${
      game!.turn
    }/start_time`]: SERVER_TIMESTAMP,
  });
}
/**
 * Triggered by the cluegiver when they get their team to correctly guess a phrase.
 * @param id ID of the phrase to mark as guessed.
 */
export async function turnGuessed(): Promise<void> {
  const turn: PhraseTurn = currentTurn()!;
  let remaining: number[] = currentRound()!.remaining;
  let cursor = turn.cursor;
  const id = turn.deck[cursor];
  const guessed = turn.guessed || [];
  const deck = turn.deck.slice();
  guessed.push(id);
  remaining = remaining.filter((rid) => rid !== id);
  deck.splice(cursor, 1);
  if (cursor >= deck.length) {
    cursor = 0;
  }

  const update = {
    [currentRoundPath() + "/remaining"]: remaining,
    [currentTurnPath() + "/deck"]: deck,
    [currentTurnPath() + "/guessed"]: guessed,
    [currentTurnPath() + "/cursor"]: cursor,
  };

  // this round is over!
  if (remaining.length === 0) {
    update[currentRoundPath() + "/end_time"] = SERVER_TIMESTAMP;
    update[currentRoundPath() + "/red_score"] = roundScore(
      getState().game!.round!,
      "red"
    );
    update[currentRoundPath() + "/blue_score"] = roundScore(
      getState().game!.round!,
      "blue"
    );
  }

  await roomRef().update(update);
}
/**
 * Triggered by the cluegiver when they want to skip the current phrase and move to the next.
 * @param id ID of the phrase to skip.
 */
export async function turnSkip(): Promise<void> {
  const turn = currentTurn()!;
  const skipped = turn.skipped || [];
  let cursor = turn.cursor;
  const id = turn.deck[cursor];
  skipped.push(id);
  cursor = (cursor + 1) % turn.deck.length;

  await roomRef().update({
    [currentTurnPath() + "/skipped"]: skipped,
    [currentTurnPath() + "/cursor"]: cursor,
  });
}

export async function startNextRound(): Promise<void> {
  const round = getState().game!.round!;
  const rounds = getState().game!.rounds!;
  const nextRound = round + 1;

  if (round === 3) {
    const red_score =
      rounds["round1"].red_score! +
      rounds["round2"].red_score! +
      rounds["round3"].red_score!;
    const blue_score =
      rounds["round1"].blue_score! +
      rounds["round2"].blue_score! +
      rounds["round3"].blue_score!;
    return roomRef().update({
      red_score,
      blue_score,
      end_time: SERVER_TIMESTAMP,
      state: "end",
    });
  }

  await roomRef().update({
    round: nextRound,
    [`rounds/round${nextRound}/start_time`]: SERVER_TIMESTAMP,
  });
  await nextTurn();
}

export async function playAgain(): Promise<void> {
  const game = getState().game!;
  const data = newGame(game.captain, "");
  data.players = game.players!;
  await roomRef().set(data);
}
