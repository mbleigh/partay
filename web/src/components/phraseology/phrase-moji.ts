import { PartayBase } from "../base";
import { html } from "lit-html";
import { property } from "lit-element";
import { updateEmoji } from "../../actions/phraseology";
import { currentRound } from "../../helpers/data";
import { State } from "../../types";
import EmojiButton from "@joeattardi/emoji-button";

class PhraseMoji extends PartayBase {
  @property({ type: String }) value: string = "";

  emojiButton?: EmojiButton;

  connectedCallback() {
    super.connectedCallback();
    this.emojiButton = new EmojiButton({
      theme: "dark",
      autoHide: false,
      position: "bottom",
      emojiSize: "1.4em",
    });

    this.emojiButton.on("emoji", (emoji) => {
      updateEmoji(this.input().value + emoji);
    });
  }

  input(): HTMLInputElement {
    return this.querySelector("input")! as HTMLInputElement;
  }

  reduce(state: State) {
    const emoji = currentRound()?.emoji;
    const el = this.querySelector("input");
    if (el && emoji !== el?.value) {
      el.value = emoji || "";
    }
  }

  toggleEmojiPicker() {
    console.log("showpicker");
    this.emojiButton?.togglePicker(this.input());
  }

  render() {
    return html`
      <div class="flex flex-row px-2">
        <input
          class="flex-1 bg-gray-900 border border-gray-700 p-3"
          @input=${(e: Event) => updateEmoji(this.input().value)}
        />
        <button
          @click=${this.toggleEmojiPicker}
          class="p-3 bg-gray-900 border border-gray-700"
        >
          <i class="material-icons">insert_emoticon</i>
        </button>
      </div>
    `;
  }
}

customElements.define("phrase-moji", PhraseMoji);
