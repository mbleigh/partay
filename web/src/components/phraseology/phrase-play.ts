import { PartayBase } from "../base";
import {
  State,
  PhraseTurn,
  PhraseRound,
  Phrase,
  PhraseTeam,
} from "../../types";
import { property, html } from "lit-element";
import { currentTurn, currentRound } from "../../helpers/data";
import {
  turnStart,
  turnGuessed,
  turnSkip,
  nextTurn,
} from "../../actions/phraseology";
import { expandPhrase } from "../../phraseology/deck";

import "./phrase-countdown";

const RULES_FOR_TYPE = {
  anything:
    "Anything goes! Talk, make sounds, wave your arms, just don't say the phrase itself.",
  one_word:
    "You can only give a single word clue for each phrase. Repeat as needed, but just one word!",
  emoji:
    "Use your keyboard to send an emoji clue to other players. Get creative!",
};

class PhrasePlay extends PartayBase {
  @property({ type: Boolean }) isCluegiver: boolean = false;
  @property({ type: Object }) currentTurn: PhraseTurn | null = null;
  @property({ type: Object }) currentRound: PhraseRound | null = null;
  @property({ type: String }) cluegiverName: string = "";
  @property({ type: Object }) currentPhrase: Phrase | null = null;
  @property({ type: Object }) guessingTeam: PhraseTeam = "red";
  @property({ type: Object }) playerTeam: PhraseTeam = "red";
  @property({ type: Boolean }) turnOver: boolean = false;

  timeout: NodeJS.Timeout | null = null;

  reduce(state: State) {
    this.currentRound = currentRound();
    this.currentTurn = currentTurn();
    this.playerTeam = state.game!.players[state.uid!].team;
    this.isCluegiver = state.uid! === this.currentTurn!.player;
    this.guessingTeam = state.game!.players[this.currentTurn!.player].team;
    this.cluegiverName = state.game!.players[this.currentTurn!.player].name;
    this.currentPhrase = expandPhrase(
      (this.currentTurn!.deck || [])[this.currentTurn!.cursor]
    );
    console.log(this.currentTurn);
    if (this.currentTurn?.start_time) {
      this.turnOver = Date.now() - this.currentTurn.start_time > 60000;
      if (!this.turnOver && !this.timeout) {
        this.timeout = setTimeout(
          () => (this.turnOver = true),
          this.currentTurn.start_time + 60000 - Date.now()
        );
      }
    }

    return;
  }

  render() {
    console.log(this.currentTurn, this.isCluegiver);
    if (this.currentTurn?.start_time) {
      return this.turnOver ? this.renderEnd() : this.renderPlay();
    }
    return this.renderPrep();
  }

  correctGuesses() {
    if (this.currentTurn?.guessed) {
      return html`<div class="text-center text-green-500 mt-5">
        ${this.currentTurn.guessed.length} correct guesses
      </div>`;
    }
    return html`<div class="text-center text-gray-300 mt-5">
      No guesses yet.
    </div>`;
  }

  renderPlay() {
    return html`
      <phrase-countdown class="text-center text-5xl block my-3" start=${
        this.currentTurn?.start_time
      } duration="60"></phrase-countdown></h3>
      ${
        this.isCluegiver && this.currentPhrase
          ? html`<div class="bg-white m-3 rounded px-3 py-2 max-w-sm text-center mx-auto h-28">
        <h3 class="text-purple-700 mb-3">${this.currentPhrase.phrase}</h3>
        <p class="text-sm text-gray-800">${this.currentPhrase.clue}</h3>
      </div>`
          : ""
      }
      ${this.correctGuesses()}
      <div class="text-gray-300 text-center mt-">${
        (this.currentTurn?.deck || []).length
      } phrases remain</div>
      ${this.isCluegiver ? this.renderCluegiver() : this.renderSpectator()}
    `;
  }

  renderEnd() {
    return html`
      <h3 class="my-4 text-center font-3xl font-bold">Time's Up!</h3>
      <p class="px-3 font-xl text-center mb-5">
        <b>${this.isCluegiver ? "You" : this.cluegiverName}</b> got the
        <b class="text-team-${this.guessingTeam}">${this.guessingTeam} team</b>
        to guess
        <b class="text-green-300"
          >${this.currentTurn?.guessed?.length || 0} phrases!</b
        >
      </p>
      ${this.isCluegiver
        ? html`<button class="btn block w-full" @click=${() => nextTurn()}>
            Pass the Deck
          </button>`
        : html`<h3 class="text-center">Waiting&hellip;</h3>`}
    `;
  }

  renderCluegiver() {
    return html`<div class="mt-5 p-3">
      <button
        @click=${() => {
          turnGuessed();
        }}
        class="block bg-green-500 mb-2 w-full text-2xl p-3 text-center"
      >
        Got It!
      </button>
      <button
        @click=${() => {
          turnSkip();
        }}
        class="block bg-red-500 mb-2 w-full text-2xl p-3 text-center"
      >
        Skip It
      </button>
    </div>`;
  }

  renderSpectator() {
    return html`
      <div class="text-center px-4 mt-8">
        <h3 class="text-2xl font-bold uppercase">
          ${this.playerTeam === this.guessingTeam ? "Guess Now!" : "Shhhhhh!"}
        </h3>
        <p>
          <b>${this.cluegiverName}</b> is giving clues for the
          <b class="text-team-${this.guessingTeam}">${this.guessingTeam} team</b
          >.
        </p>
      </div>
    `;
  }

  renderPrep() {
    console.log("renderPrep()");
    return html`
      <h3 class="text-center text-purple-300 mt-4">
        ${this.isCluegiver ? "You're up next!" : `${this.cluegiverName} is up!`}
      </h3>
      <p class="text-center text-sm my-2 max-w-xs mx-auto">
        ${this.isCluegiver ? "You" : "The cluegiver will"} have one minute to
        get your team to guess as many phrases as possible.
      </p>
      <h3 class="text-center text-purple-300 mt-8">Rules for This Round</h3>
      <p class="my-2 text-center text-sm max-w-xs mx-auto">
        ${RULES_FOR_TYPE[this.currentRound!.type]}
      </p>
      ${this.isCluegiver
        ? html`<button
            @click=${(e) => turnStart()}
            class="mt-6 btn block w-full"
          >
            Start Your Turn
          </button>`
        : ""}
    `;
  }
}

customElements.define("phrase-play", PhrasePlay);
