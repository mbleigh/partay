import { PartayBase } from "../base";
import { html } from "lit-html";
import { State, PhrasePlayer, PhraseTeam } from "../../types";
import { property, css } from "lit-element";
import { asArray } from "../../helpers/data";
import {
  lobbyStart,
  lobbyShuffleTeams,
  lobbySwitchTeams,
  addPhrase,
} from "../../actions/phraseology";
import { formValue } from "../../helpers/html";

const MIN_PLAYERS = 4;

class PhraseLobby extends PartayBase {
  @property({ type: Boolean }) isCaptain?: boolean = false;
  @property({ type: Boolean }) hasEnoughPlayers?: boolean = false;
  @property({ type: String }) captain?: string;
  @property({ type: Object }) players?: { [uid: string]: PhrasePlayer };
  @property({ type: String }) playerName?: string;
  @property({ type: Boolean }) copied: boolean = false;
  @property({ type: Boolean }) showPhraseForm: boolean = false;
  @property({ type: Boolean }) phraseConsent: boolean = true;
  @property({ type: Number }) customPhraseCount: number = 0;

  reduce(state: State) {
    console.log("reduce has been called");
    this.isCaptain = state.uid === state.game?.captain;
    this.hasEnoughPlayers =
      Object.keys(state.game?.players || {}).length >= MIN_PLAYERS;
    this.captain = state.game?.captain;
    this.players = state.game?.players;
    this.customPhraseCount = state.game?.custom_phrases?.length || 0;
    this.playerName = state.game?.players[state.uid!]?.name;
  }

  renderTeam(team: PhraseTeam) {
    return html`
      <h3 class="uppercase text-sm text-center">${team} team</h3>
      <ol team=${team}>
        ${asArray<PhrasePlayer>(this.players || {})
          .filter((p) => p.team === team)
          .map(
            (p) => html`<li class="p-2">
              <div
                class="block rounded-full py-1 px-2 text-sm text-center fill-team-${p.team}"
                team=${p.team}
                ?captain=${p.key === this.captain}
              >
                ${p.name}
              </div>
            </li>`
          )}
      </ol>
    `;
  }

  renderAction() {
    if (this.isCaptain && this.hasEnoughPlayers) {
      return html`<button
        @click=${(e: Event) => {
          e.preventDefault();
          lobbyStart();
        }}
        class="btn"
      >
        Start Game
      </button>`;
    } else if (!this.hasEnoughPlayers) {
      return html`<div class="m-3 text-center">
        Waiting for Players&hellip;
      </div>`;
    } else {
      return html`<div class="m-3 text-center">
        Waiting for Captain&hellip;
      </div>`;
    }
  }

  async addPhrase(e: Event) {
    e.preventDefault();
    const phrase = formValue("#add-phrase");
    const clue = formValue("#add-clue");

    if (phrase === "" || phrase.length === 1) {
      return;
    }

    await addPhrase(phrase, clue, this.phraseConsent);
    (e.target as HTMLFormElement).reset();
    this.showPhraseForm = false;
  }

  render() {
    return html`
      <h2 class="text-center p-3">Waiting for players&hellip;</h2>
      <div class="text-center mt-2 mb-5">
        <button
          class="inline-block py-3 px-5 bg-gray-900 rounded text-center text-lg"
          @click=${async (e: Event) => {
            await navigator.clipboard?.writeText(window.location.href);
            this.copied = true;
            (e.target as any).blur();
            setTimeout(() => {
              this.copied = false;
            }, 2000);
          }}
        >
          <i class="material-icons align-middle">filter_none</i> ${this.copied
            ? "Copied to Clipboard"
            : "Copy Game Link"}
        </button>
      </div>
      <div class="flex-1 flex flex-row">
        <div class="flex-1">${this.renderTeam("red")}</div>
        <div class="flex-1">${this.renderTeam("blue")}</div>
      </div>
      <div
        class="text-center p-3 text-xl font-bold${this.customPhraseCount === 0
          ? " hidden"
          : ""}"
      >
        ${this.customPhraseCount} custom
        phrase${this.customPhraseCount === 1 ? "" : "s"}
      </div>
      <div class="flex flex-col p-2 bg-gray-900 md:rounded-t-lg">
        <button
          class="btn block mb-1"
          @click=${(e: Event) => {
            this.showPhraseForm = true;
            (e.target as HTMLButtonElement).blur();
          }}
        >
          Add Custom Phrase
        </button>
        <button class="btn block mb-1" @click=${() => lobbySwitchTeams()}>
          Switch Teams
        </button>
        ${this.isCaptain
          ? html`<button
              class="btn block mb-1"
              @click=${() => lobbyShuffleTeams()}
            >
              Shuffle Teams
            </button>`
          : null}
        ${this.renderAction()}
      </div>
      <div
        class="fixed bg-overlay align-middle justify-center top-0 left-0 bottom-0 right-0 flex flex-col${this
          .showPhraseForm
          ? ""
          : " hidden"}"
        @click=${(e: Event) => {
          if (e.target === e.currentTarget) this.showPhraseForm = false;
        }}
      >
        <form
          class="bg-gray-800 mx-auto rounded-lg w-64 relative"
          @submit=${this.addPhrase}
        >
          <h3 class="text-center font-bold mb-5 rounded-t bg-gray-900 p-3">
            Add a Phrase
          </h3>
          <div class="flex flex-col px-3 pb-3">
            <label for="add-phrase">Phrase:</label>
            <input
              id="add-phrase"
              type="text"
              class="bg-gray-900 block px-3 py-2 text-xl rounded border border-gray-700 w-auto"
            />
            <label for="add-clue">Clue:</label>
            <textarea
              id="add-clue"
              class="bg-gray-900 block px-3 py-2 text-xl rounded border border-gray-700 w-auto"
            ></textarea>
            <p class="text-sm text-center mt-2">
              <button
                type="button"
                @click=${(e: Event) => {
                  (e.target as HTMLButtonElement).blur();
                  this.phraseConsent = !this.phraseConsent;
                }}
                class="bg-gray-900 rounded px-2 p-1"
              >
                ${this.phraseConsent ? "Okay to" : "Please don't"}
              </button>
              consider my phrase for inclusion in the game.
            </p>
            <button type="submit" class="my-3 btn block mb-1">
              Submit Phrase
            </button>
            <button
              type="button"
              class="bg-black rounded-full m-4 w-6 h-6 text-center absolute top-0 right-0"
              @click=${() => {
                this.showPhraseForm = false;
              }}
            >
              <i class="material-icons">close</i>
            </button>
          </div>
        </form>
      </div>
    `;
  }
}

customElements.define("phrase-lobby", PhraseLobby);
