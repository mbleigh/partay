import { PartayBase } from "../base";
import { property, html } from "lit-element";
import { State, Phrase } from "../../types";
import { expandDeck } from "../../phraseology/deck";
import { allReady } from "../../helpers/data";
import {
  toggleReady,
  toggleDiscard,
  startPlay,
} from "../../actions/phraseology";

class PhrasePrep extends PartayBase {
  @property({ type: Array }) deck: number[] = [];
  @property({ type: Boolean }) isCaptain: boolean = false;
  @property({ type: Boolean }) isReady: boolean = false;
  @property({ type: Boolean }) allReady: boolean = false;
  @property({ type: Array }) discards: number[] = [];

  reduce(state: State) {
    this.deck = state.game?.players[state.uid!]?.deck || [];
    this.isCaptain = state.game?.captain === state.uid;
    this.isReady = state.game?.readies?.[state.uid!] || false;
    this.allReady = allReady(state?.game?.captain);
    this.discards = state.game?.players?.[state.uid!]?.discards || [];
  }

  renderPhrase(p: Phrase) {
    return html`
      <div
        phraseid=${p.id}
        class="bg-white rounded text-black my-1 mx-auto text-center py-3 px-5 border-2 border-pink-500 phrase-card-pick"
        ?discarded=${this.discards.includes(p.id)}
        @click=${() => toggleDiscard(p.id)}
      >
        <h3 class="text-pink-700">${p.phrase}</h3>
        <p class="text-left text-gray-700 text-sm">${p.clue}</p>
      </div>
    `;
  }

  renderAction() {
    if (this.isCaptain && this.allReady) {
      return html`<button
        class="btn block my-2 w-full"
        @click=${() => startPlay()}
      >
        Let's Play!
      </button>`;
    } else if (this.isCaptain) {
      return html`<h3 class="p-3 text-center">Waiting for players&hellip;</h3>`;
    } else {
      return html`<button
        class="btn block my-2 w-full"
        @click=${() => {
          toggleReady();
        }}
      >
        I'm ${this.isReady ? "Not " : ""}Ready
      </button>`;
    }
  }

  render() {
    return html`
      <div class="px-2">
        <h3 class="text-center my-2">
          Tap and discard up to 3&hellip;
        </h3>
        <div class="max-w-sm mx-auto">
          ${expandDeck(this.deck).map((p) => this.renderPhrase(p))}
        </div>
        ${this.renderAction()}
      </div>
    `;
  }
}

customElements.define("phrase-prep", PhrasePrep);
