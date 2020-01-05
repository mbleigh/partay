import { html, property } from 'lit-element';
import { firebase, db } from '../firebase';
import { PlayerData } from '../models';
import { PartayElement } from './PartayElement';

import "./LobbyPlayer";

export class LobbyHost extends PartayElement {
  render() {
    return html`
      <h1>Let's Play SketchAround! (${this.state.code})</h1>
      <div id="players">
        ${this.state.data?.players ? Object.values(this.state.data.players).map(p => html`<lobby-player uid=${p.uid} name=${p.name}></lobby-player>`) : 'No players yet.'}
      </div>
    `;
  }
}

customElements.define('lobby-host', LobbyHost);
