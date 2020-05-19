import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createObjectCsvStringifier } from "csv-writer";

const TWELVE_HOURS = 60000 * 60 * 12;

admin.initializeApp();

export const fyc = functions.https.onRequest(async (req, res) => {
  const snap = await admin
    .database()
    .ref("games/phraseology/phrases")
    .once("value");
  const csvOut = createObjectCsvStringifier({
    header: [
      "set",
      "id",
      "phrase",
      "clue",
      "franchise",
      "tags",
      "rating",
      "attribution",
      "timestamp",
    ],
  });

  const out: {
    phrase: string;
    clue: string;
    attribution?: string;
    timestamp?: number;
  }[] = [];
  snap.forEach((pSnap) => {
    const p = pSnap.val();
    out.push({
      phrase: p.phrase,
      clue: p.clue,
      attribution: p.attribution,
      timestamp: p.timestamp,
    });
  });

  res.set("content-type", "text/csv");
  res.send(csvOut.stringifyRecords(out));
});

export const cleanStaleGames = functions.pubsub
  .schedule("0 0 * * *")
  .onRun(async () => {
    const snap = await admin
      .database()
      .ref("games/phraseology/rooms")
      .once("value");
    const promises: Promise<void>[] = [];
    snap.forEach((gameSnap) => {
      const state = gameSnap.child("state").val();
      const createTime = gameSnap.child("create_time").val();
      if (createTime < Date.now() - TWELVE_HOURS && state === "lobby") {
        console.log(
          "Cleaning up stale game",
          gameSnap.key,
          "created at",
          new Date(createTime).toISOString()
        );
        promises.push(gameSnap.ref.remove());
      }
    });
    await Promise.all(promises);
  });
