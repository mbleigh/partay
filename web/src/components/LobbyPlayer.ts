import { property, html, LitElement, css } from "lit-element";

export class LobbyPlayer extends LitElement {
  @property({type: Boolean}) isHost: boolean = false;
  @property({type: String}) uid: string = '';
  @property({type: String}) name: string = '';

  static get styles() {
    return css`
      #player {
        display: flex;
        flex-direction: column;
        width: 80px;
        height: 120px;
      }

      #initial {
        display: block;
        width: 80px;
        height: 80px;
        font-size: 64px;
        text-align: center;
        line-height: 80px;
        background: blue;
        color: white;
      }

      #name {
        display: block;
        text-align: center;
        font-size: 22px;
        line-height: 30px;
        margin-top: 10px;
      }
    `
  }

  render() {
    return html`
      <div id="player">
        <span id="initial">${this.name.slice(0, 1)}</span>
        <span id="name">${this.name}</span>
      </div>
    `;
  }
}
customElements.define('lobby-player', LobbyPlayer);
