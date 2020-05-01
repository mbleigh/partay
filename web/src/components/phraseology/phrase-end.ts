import { PartayBase } from "../base";
import { State, PhraseTeam } from "../../types";
import { property, html } from "lit-element";
import { capitalize } from "../../helpers/html";
import { playAgain } from "../../actions/phraseology";

class PhraseEnd extends PartayBase {
  @property({ type: Boolean }) isCaptain: boolean = false;
  @property({ type: String }) winningTeam: PhraseTeam = "red";
  @property({ type: Number }) winningScore: number = 0;
  @property({ type: String }) losingTeam: PhraseTeam = "blue";
  @property({ type: Number }) losingScore: number = 0;

  reduce(state: State) {
    const redScore = state.game!.red_score!;
    const blueScore = state.game!.blue_score!;

    if (redScore > blueScore) {
      this.winningTeam = "red";
      this.winningScore = redScore;
      this.losingTeam = "blue";
      this.losingScore = blueScore;
    } else {
      this.winningTeam = "blue";
      this.winningScore = blueScore;
      this.losingTeam = "red";
      this.losingScore = redScore;
    }

    this.isCaptain = state.uid === state.game?.captain;
  }

  render() {
    if (this.winningScore === this.losingScore) {
      return this.renderTie();
    }
    return this.renderWin();
  }

  renderTie() {
    return html`
      <h2 class="text-4xl mt-4 py-6 text-center bg-gray-600 font-bold rounded">
        It's a Tie!
      </h2>
      <h3 class="mt-3 text-center">
        Final Score: ${this.winningScore}&mdash;${this.losingScore}
      </h3>
      ${this.renderPlayAgain()}
    `;
  }

  renderWin() {
    return html`
      <div
        class="fill-team-${this
          .winningTeam} mt-4 mb-3 rounded py-5 px-3 text-center"
      >
        <h2 class="uppercase text-3xl font-bold">${this.winningTeam} wins!</h2>
        <h3>Final Score: ${this.winningScore}</h3>
      </div>
      <div class="fill-team-${this.losingTeam} rounded p-3 text-center">
        ${capitalize(this.losingTeam)} Score: ${this.losingScore}
      </div>
      ${this.renderPlayAgain()}
    `;
  }

  renderPlayAgain() {
    return html`
      ${this.isCaptain
        ? html`<button
            class="mt-4 btn block w-full"
            @click=${() => playAgain()}
          >
            Play Again
          </button>`
        : html`<h3 class="mt-4 text-center p-3">Thanks for playing!</h3>`}
    `;
  }
}

customElements.define("phrase-end", PhraseEnd);
