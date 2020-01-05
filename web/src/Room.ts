import { firebase, db, auth } from "./firebase";
import { RoomData } from './models';

const LETTERSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

type GameType = 'sketcharound';

export class Room<T = any> {
  static generateCode(): string {
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += LETTERSET[Math.floor(Math.random()*LETTERSET.length)];
    }
    return code;
  }

  static async create(uid: string, game: GameType): Promise<Room> {
    const code = Room.generateCode();
    const room = new Room(code);
    await room.ref.set({
      host: uid,
      game,
      create_time: firebase.database.ServerValue.TIMESTAMP,
      update_time: firebase.database.ServerValue.TIMESTAMP
    });
    return room;
  }

  code: string;
  ref: firebase.database.Reference;
  playersRef: firebase.database.Reference;
  stateRef: firebase.database.Reference;
  connected: boolean;
  unsubscribe: firebase.Unsubscribe;
  data: RoomData;
  subscriptions: ((roomData: any) => any)[];

  constructor(code: string) {
    this.code = code;
    this.ref = db.ref('rooms').child(code);
    this.playersRef = this.ref.child('players');
    this.stateRef = this.ref.child('state');
    this.subscriptions = [];
  }

  async connect(): Promise<void> {
    if (this.connected) { return Promise.resolve(); }
    const handler = (snap: firebase.database.DataSnapshot) => {
      this.connected = true;
      this.onValue(snap);
    };
    this.ref.on('value', handler);
    this.unsubscribe = () => { this.ref.off('value', handler); };
  }

  subscribe(callback: (room: Room<T>) => any): () => void {
    this.subscriptions.push(callback);
    return () => {
      const i = this.subscriptions.indexOf(callback);
      if (i >= 0) {
        this.subscriptions.splice(i, 1);
      }
    }
  }

  private onValue(snap: firebase.database.DataSnapshot) {
    this.data = snap.val();
    this.subscriptions.forEach(sub => sub(this));
  }
}
