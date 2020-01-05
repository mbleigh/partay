import { LitElement, html } from 'lit-element';
import { PartayElement } from './PartayElement';

class PartayHome extends PartayElement {
  fieldValue(name: string): string {
    return (this.shadowRoot.querySelector(`[name="${name}"]`) as HTMLInputElement)?.value;
  }

  render() {
    return html`
      <form id="join" @submit=${this.dispatchHandler('joinRoom', () => ({name: this.fieldValue('name'), code: this.fieldValue('code')}))}}>
        <div>
          <label for="field-name">Player Name</label>
          <input type="text" id="field-name" maxlength="20" name="name">
        </div>
        <div>
          <label for="field-code">Room Code</label>
          <input type="text" id="field-code" maxlength="4" name="code">
        </div>
        <button type="submit" ?disabled=${!this.state.user}>Join Game</button>
      </form>
      <hr>
      <button @click=${this.dispatchHandler('createRoom')} ?disabled=${!this.state.user}>Host Game</button>
    `
  }
}
customElements.define('partay-home', PartayHome);
