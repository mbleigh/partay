import "../boot";

import { html, property } from 'lit-element';
import { db, auth, firebase } from '../firebase';
import { PartayElement } from './PartayElement';
import { PlayerData, RoomData } from '../models';

import "./PartayHome";
import "./LobbyHost";
import { setState } from "../state";

class PartayApp extends PartayElement {
  render() {
    switch (this.state.page) {
      case "home":
        return html`<partay-home></partay-home>`;
      case "host":
        return html`<lobby-host></lobby-host>`;
      case "play":
        return html`<h1>Lobby Client!</h1>`;
    }
  }
}
customElements.define('partay-app', PartayApp);
