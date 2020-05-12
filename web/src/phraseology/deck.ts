import { phrases } from "./data/phrases.json";
import { Phrase } from "../types";

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
  return ids.map((id) => PHRASE_ID_MAP[id]);
}

export function expandPhrase(id: number): Phrase {
  return PHRASE_ID_MAP[id];
}

export function dealDeck(
  ids: number[],
  buckets: string[]
): { [bucket: string]: number[] } {
  const randids: number[] = ids.slice().sort(() => Math.random() - 0.5);
  const out: { [bucket: string]: number[] } = {};
  let i = 0;
  while (randids.length) {
    out[buckets[i]] = out[buckets[i]] || [];
    out[buckets[i]].push(randids.pop()!);
    i = (i + 1) % buckets.length;
  }
  return out;
}
