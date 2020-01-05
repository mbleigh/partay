import { LitElement, property } from 'lit-element';
import { subscribe, getState } from '../state';
import { State } from '../models';

export class PartayElement extends LitElement {
  @property({type: Object}) state: State = {};
  dispatchAction(type: string, payload?: any) {
    this.dispatchEvent(new CustomEvent('action', {
      detail: {type, payload: payload || null},
      bubbles: true,
      composed: true,
    }));
  }

  dispatchHandler(actionType: string, payloadBuilder: (e?: Event) => any = null): (e: Event) => any {
    return (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.dispatchAction(actionType, payloadBuilder ? payloadBuilder(e) : null);
    }
  }

  connectedCallback() {
    this.state = getState();
    super.connectedCallback();
    subscribe(state => this.state = state);
  }
}
