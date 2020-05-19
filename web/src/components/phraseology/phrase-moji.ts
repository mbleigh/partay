import { PartayBase } from "../base";
import { html } from "lit-html";
import { property } from "lit-element";
import { updateEmoji } from "../../actions/phraseology";
import { currentRound } from "../../helpers/data";
import { State } from "../../types";

import { direct, indirect } from "../../phraseology/data/emoji.json";
import emojiRegexFactory from "emoji-regex";

class PhraseMoji extends PartayBase {
  @property({ type: String }) rawValue: string = "";
  @property({ type: String }) value: string = "";

  connectedCallback() {
    super.connectedCallback();
  }

  get textarea(): HTMLTextAreaElement {
    return this.querySelector("textarea")! as HTMLTextAreaElement;
  }

  reduce(state: State) {
    const emoji = currentRound()?.emoji;
    if (this.textarea && emoji !== this.value) {
      this.textarea.value = emoji || "";
      this.updateValue();
      this.textarea.focus();
    }
  }

  render() {
    return html`
      <div class="flex flex-col">
        <div class="bg-gray-900 rounded p-2 px-3 text-center mb-2 h-12">
          ${this.value}
        </div>
        <textarea
          class="block flex-1 bg-gray-900 border border-gray-700 p-3 text-sm"
          @input=${this.updateValue}
        ></textarea>
        <div class="text-xs mt-2 mb-3 text-center">
          Enter emoji or type emoji keywords (<code>with_underscores</code>) to
          send your clue.
        </div>
      </div>
    `;
  }

  translateEmoji(value: string): string {
    return value
      .toLowerCase()
      .split(" ")
      .map((word) => {
        if ((direct as any)[word]) {
          return (direct as any)[word];
        } else if ((indirect as any)[word]) {
          return (indirect as any)[word];
        }

        let emojiInWord: string[] = [];
        const emojiRegex = emojiRegexFactory();
        let match;
        while ((match = emojiRegex.exec(word))) {
          emojiInWord.push(match[0]);
        }
        console.log("found emoji:", emojiInWord);
        return emojiInWord.join("");
      })
      .join("");
  }

  updateValue() {
    this.rawValue = this.textarea.value;
    this.value = this.translateEmoji(this.rawValue);
    updateEmoji(this.value);
  }
}

customElements.define("phrase-moji", PhraseMoji);
