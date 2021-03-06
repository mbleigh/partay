import { LitElement, property, html } from "lit-element";
import { TURN_DURATION } from "../../helpers/phraseology";

class PhraseCountdown extends LitElement {
  @property({ type: Number }) start: number = 0;
  @property({ type: Number }) duration: number = TURN_DURATION;

  interval: NodeJS.Timeout | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.interval = setInterval(() => this.requestUpdate(), 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.interval!);
  }

  countdown(): number {
    const end = this.start + this.duration;
    return Math.max(Math.floor((end - Date.now()) / 1000), 0);
  }

  render() {
    return html`<span>${this.countdown()}</span>`;
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define("phrase-countdown", PhraseCountdown);
