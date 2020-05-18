import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createObjectCsvStringifier } from "csv-writer";

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
