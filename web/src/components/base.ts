import { LitElement } from "lit-element";
import { subscribe, getState } from "../state";
import { State } from "../types";

export class PartayBase extends LitElement {
  stateSubscription?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.stateSubscription = subscribe((state) => {
      this.reduce(state);
    });
    this.reduce(getState());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.stateSubscription) {
      this.stateSubscription();
    }
  }

  reduce(state: State): void {}

  createRenderRoot() {
    return this;
  }
}
