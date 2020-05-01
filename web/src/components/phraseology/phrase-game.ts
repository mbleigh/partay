import { PartayBase } from "../base";
import { html } from "lit-html";
import { property } from "lit-element";
import { State, PhraseGameState } from "../../types";

import "./phrase-lobby";
import "./phrase-prep";
import "./phrase-play";
import { leaveRoom } from "../../actions/common";

class PhraseGame extends PartayBase {
  @property({ type: String }) name?: string;
  @property({ type: String }) state?: PhraseGameState;
  @property({ type: String }) room?: string;
  @property({ type: String }) team?: string;
  reduce(state: State): void {
    if (!state.game) {
      return;
    }

    this.name = state.game.players[state.uid!]?.name;
    this.state = state.game.state;
    this.room = state.room;
    this.team = state.game.players[state.uid!]?.team;
  }

  renderStatePage() {
    switch (this.state) {
      case "lobby":
        return html`<phrase-lobby
          class="flex flex-col flex-1}"
        ></phrase-lobby>`;
      case "prep":
        return html`<phrase-prep class="flex-1"></phrase-prep>`;
      case "play":
        return html`<phrase-play class="flex-1"></phrase-play>`;
      default:
        return html`<b>NOT IMPLEMENTED</b>`;
    }
  }

  render() {
    return html`
      <header
        class="flex flex-row bg-gray-900 py-1 px-2 text-l fill-team-${this
          .team || "none"}"
      >
        <span class="flex-1">${this.name}</span>
        <span>${this.room}</span>
        <span @click=${() => leaveRoom()} class="ml-2">X</span>
      </header>
      ${this.renderStatePage()}
    `;
  }
}

customElements.define("phrase-game", PhraseGame);
