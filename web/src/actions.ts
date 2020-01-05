import { getState, setState } from "./state";
import { db, firebase } from "./firebase";
import page from "page";

function roomRef(code: string): firebase.database.Reference {
  return db.ref('rooms').child(code);
}

function playerRef(code: string, uid: string): firebase.database.Reference {
  return db.ref('rooms').child(code).child('players').child(uid);
}

const LETTERSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function generateCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += LETTERSET[Math.floor(Math.random()*LETTERSET.length)];
  }
  return code;
}

export async function createRoom() {
  const {user} = getState();
  const code = generateCode();
  await db.ref('rooms').child(code).set({
    host: user.uid,
    game: 'sketcharound',
    create_time: firebase.database.ServerValue.TIMESTAMP,
    update_time: firebase.database.ServerValue.TIMESTAMP
  });
  page(`/host/${code}`);
}

export async function joinRoom({name, code}) {
  console.log(arguments);
  const {user, data} = getState();
  if (!data?.players?.[user?.uid]) {
    await playerRef(code, user.uid).set({
      uid: user.uid,
      name,
      status: 'active',
      join_time: firebase.database.ServerValue.TIMESTAMP,
    });

    playerRef(code, user.uid).onDisconnect().update({
      disconnect_time: firebase.database.ServerValue.TIMESTAMP,
      status: 'away',
    });
  }
}
