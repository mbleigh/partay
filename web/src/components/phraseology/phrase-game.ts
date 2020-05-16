import { PartayBase } from "../base";
import { html } from "lit-html";
import { property } from "lit-element";
import { State, PhraseGameState, GameError } from "../../types";

import "./phrase-lobby";
import "./phrase-prep";
import "./phrase-play";
import "./phrase-end";
import { leaveRoom, joinRoom } from "../../actions/common";
import page from "page";
import { setState } from "../../state";
import { formValue } from "../../helpers/html";
import { asArray } from "../../helpers/data";

class PhraseGame extends PartayBase {
  @property({ type: String }) name?: string;
  @property({ type: String }) state?: PhraseGameState;
  @property({ type: String }) room?: string;
  @property({ type: String }) team?: string;
  @property({ type: Object }) error?: GameError | null = null;
  @property({ type: Boolean }) isLoading: boolean = true;
  @property({ type: Boolean }) isPlayer: boolean = false;
  @property({ type: String }) playerNames: string[] = [];

  reduce(state: State): void {
    this.error = state.error;

    this.isLoading = !state.uid;

    if (!state.game) {
      return;
    }

    if (state.game.players?.[state.uid!]) {
      this.isPlayer = true;
    }

    this.playerNames = asArray(state.game.players).map((p) => p.name);

    this.name = state.game.players[state.uid!]?.name;
    this.state = state.game.state;
    this.room = state.room;
    this.team = state.game.players[state.uid!]?.team;
  }

  renderLoading() {
    return html`<p class="text-center py-8">Loading&hellip;</p>`;
  }

  renderJoinForm() {
    return html`
      <h3 class="text-center text-2xl font-bold mt-5">
        Join Game ${this.room}
      </h3>
      <p class="text-lg mt-3 text-center">
        <b>Current Players:</b> ${this.playerNames.join(", ")}
      </p>
      <form
        id="ingame-join"
        class="p-3"
        @submit=${(e: Event) => {
          e.preventDefault();
          return joinRoom(
            "phraseology",
            this.room!,
            formValue("#ingame-join-name")
          );
        }}
      >
        <div class="mt-2">
          <label class="block" for="ingame-join-name">Your Name:</label>
          <input id="ingame-join-name" type="text" name="name" class="w-full" />
        </div>

        <button class="btn w-full mt-4" type="submit">Join Game</button>
      </form>
    `;
  }

  renderStatePage() {
    if (this.isLoading) {
      return this.renderLoading();
    }

    if (!this.isPlayer && this.state === "lobby") {
      return this.renderJoinForm();
    } else if (!this.isPlayer) {
      return html`cant join game`;
    }

    switch (this.state) {
      case "lobby":
        return html`<phrase-lobby
          class="flex flex-col flex-1 h-full"
        ></phrase-lobby>`;
      case "prep":
        return html`<phrase-prep
          class="flex-1 flex flex-col h-full"
        ></phrase-prep>`;
      case "play":
        return html`<phrase-play
          class="flex-1 flex flex-col h-full"
        ></phrase-play>`;
      case "end":
        return html`<phrase-end
          class="flex-1 flex flex-col h-full"
        ></phrase-end>`;
      default:
        return this.renderLoading();
    }
  }

  render() {
    return html`
      <div class="flex flex-col mx-auto h-full container">
        ${this.error
          ? html`<p
              class="bg-red-600 p-2 text-lg"
              @click=${() => setState({ error: undefined })}
            >
              <b>Error:</b> ${this.error.message}
            </p>`
          : ""}
        <header
          class="flex flex-row py-1 px-2 text-l fill-team-${this.team ||
          "none"}"
        >
          <span class="flex-1">${this.name}</span>
          <span>${this.room}</span>
          <span @click=${() => leaveRoom()} class="ml-2">X</span>
        </header>
        ${this.renderStatePage()}
      </div>
    `;
  }
}

customElements.define("phrase-game", PhraseGame);
