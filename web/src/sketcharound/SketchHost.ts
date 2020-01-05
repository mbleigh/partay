import { LitElement, html, property } from "lit-element";
import { PlayerData } from '../models';
import { firebase, db } from "../firebase";

interface Round {
  start_time: number;
  end_time: number;
  trains: {[startUid: string]: SketchTrain};
}

interface SketchTrain {
  start_player: string;
  prompt?: string;
  sketches?: Sketch[];
}

interface Sketch {
  draw_player: string;
  drawing?: string;
  draw_start_time: number;
  draw_end_time?: number;

  guess_player: string;
  guess?: string;
  guess_start_time?: number;
  guess_end_time?: number;
}

interface SketchState {
  currentRound?: string;
  rounds?: {[roundId: string]: Round};
}

export class SketchHost extends LitElement {
  @property({type: String})
  code: string = '';
  @property({type: Array})
  players: PlayerData[] = [];
  @property({type: Object})
  state: SketchState = {};

  ref: firebase.database.Reference;
  playersRef: firebase.database.Reference;
  stateRef: firebase.database.Reference;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('connected callback');
    this.setupRefs();
  }

  setupRefs() {
    this.ref = db.ref('rooms').child(this.code);
    this.playersRef = this.ref.child('players')
    this.stateRef = this.ref.child('state');

    this.playersRef.orderByChild('join_time').on('value', this.onPlayersSnap.bind(this));
    this.stateRef.on('value', this.onStateSnap.bind(this));
  }

  teardownRefs() {
    this.playersRef?.off('value');
    this.stateRef?.off('value');
  }

  onPlayersSnap(snap: firebase.database.DataSnapshot) {
    const newPlayers = [];
    snap.forEach(player => {
      newPlayers.push(player.val());
    });
    this.players = newPlayers;
  }

  onStateSnap(snap: firebase.database.DataSnapshot) {
    this.state = snap.val() || {};
  }

  disconnectedCallback() {
    this.teardownRefs();
  }

  updated(changed) {
    if (changed.code) {
      this.teardownRefs();
      this.state = {};
      this.players = [];
      this.setupRefs();
    }
  }

  render() {
    return html`
      <h1>Sketcharound (${this.code})</h1>
      <pre>Players: ${JSON.stringify(this.players, null, 2)}</pre>
      <pre>State: ${JSON.stringify(this.state, null, 2)}</pre>
    `;
  }

  async updateState(update: SketchState) {
    await this.stateRef.update(update);
  }
}

customElements.define('sketch-host', SketchHost);
