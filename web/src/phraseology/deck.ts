import { phrases } from "./data/phrases.json";
import { Phrase } from "../types";
import { getState } from "../state";

const PHRASE_IDS = phrases.map((p) => p.id);
const PHRASE_ID_MAP: { [id: number]: Phrase } = phrases.reduce(
  (m: { [id: number]: Phrase }, p) => {
    m[p.id] = p;
    return m;
  },
  {}
);

export function generateDeck(size = 40): number[] {
  const pool = PHRASE_IDS.slice().sort(() => Math.random() - 0.5);
  return pool.slice(0, Math.min(size, PHRASE_IDS.length));
}

export function expandDeck(ids: number[]): Phrase[] {
  return ids.map((id) => expandPhrase(id));
}

export function expandPhrase(id: number): Phrase {
  if (id >= 1000000) {
    return getState().game!.custom_phrases!.find((p) => p.id === id)!;
  }
  return PHRASE_ID_MAP[id];
}

export function dealDeck(
  ids: number[],
  buckets: string[],
  customPhrases: Phrase[]
): { [bucket: string]: number[] } {
  const randids: number[] = ids.slice().sort(() => Math.random() - 0.5);
  const out: { [bucket: string]: number[] } = {};
  buckets.forEach((b) => (out[b] = []));

  customPhrases.forEach((p) => {
    const key = `players/${p.player!}/deck`;
    out[key] = out[key] || [];
    out[key].push(p.id);
  });
  console.log("with customs", out);

  while (randids.length) {
    let bucket: string;
    let minOut = 9999;
    for (const b in out) {
      if (out[b].length < minOut) {
        bucket = b;
        minOut = out[b].length;
      }
    }
    out[bucket!] = out[bucket!] || [];
    out[bucket!].push(randids.pop()!);
  }
  return out;
}
