import { PartayBase } from "../base";
import { html } from "lit-html";
import { State, PhrasePlayer, PhraseTeam } from "../../types";
import { property, css } from "lit-element";
import { asArray } from "../../helpers/data";
import {
  lobbyStart,
  lobbyShuffleTeams,
  lobbySwitchTeams,
} from "../../actions/phraseology";

const MIN_PLAYERS = 4;

class PhraseLobby extends PartayBase {
  @property({ type: Boolean }) isCaptain?: boolean = false;
  @property({ type: Boolean }) hasEnoughPlayers?: boolean = false;
  @property({ type: String }) captain?: string;
  @property({ type: Object }) players?: { [uid: string]: PhrasePlayer };
  @property({ type: String }) playerName?: string;

  reduce(state: State) {
    console.log("reduce has been called");
    this.isCaptain = state.uid === state.game?.captain;
    this.hasEnoughPlayers =
      Object.keys(state.game?.players || {}).length >= MIN_PLAYERS;
    this.captain = state.game?.captain;
    this.players = state.game?.players;
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

  async share() {
    alert("sharing");
    if ((navigator as any).share) {
      await (navigator as any).share({
        title: "Play Phraseology",
        text: `${this.playerName} wants to play a game!`,
        url: window.location.href,
      });
    }
  }

  render() {
    return html`
      <h2 class="text-center p-3">Waiting for players&hellip;</h2>
      <!--<div class="text-center">
        <button @click=${this.share}>Share Game Link</button>
      </div>-->
      <div class="flex-1 flex flex-row">
        <div class="flex-1">${this.renderTeam("red")}</div>
        <div class="flex-1">${this.renderTeam("blue")}</div>
      </div>
      <div class="flex flex-col p-2 bg-gray-900 md:rounded-t-lg">
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
    `;
  }
}

customElements.define("phrase-lobby", PhraseLobby);
